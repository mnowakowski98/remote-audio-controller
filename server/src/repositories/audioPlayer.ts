import { exec as _exec } from 'node:child_process'
import { createReadStream, writeFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

import Speaker, { Stream } from 'speaker'
import { IAudioMetadata } from 'music-metadata'
import findExec from 'find-exec'

import AudioStatus, { audioStatusKey } from '../models/audioStatus'
import AudioFileInfo from '../models/audioFileInfo'
import { sendSyncData } from '../servers/stateSync'

// Init temp files for audio
const originalFile = join(tmpdir(), '/audioplayer-original')
const playingFile = join(tmpdir(), '/audioplayer-playing')
writeFileSync(originalFile, '')
writeFileSync(playingFile, '')

// Crash out if ffmpeg isn't available
const exec = promisify(_exec)
const ffmpeg = findExec('ffmpeg')
if (ffmpeg == null) throw('ffmpeg not found')

let speaker: Speaker | null = null
let audio: Stream.Readable | null = null

let uploadedFileName: string | null = null 
let audioMetadata: IAudioMetadata | null = null

const playing = () => speaker?.closed == false
const paused = () => playing() == false && audio != null
let volume = 50
let loop = false

export const getLoop = () => loop
export const setLoop = (doLoop?: boolean) => { loop = doLoop !== undefined ? doLoop : !loop }

const getSpeakerSettings = (): Speaker.Options  => {
    if (audioMetadata == null) throw 'getSpeakerSettings requires an audio to be set'
    return {
        channels: audioMetadata.format.numberOfChannels ?? 2,
        bitDepth: audioMetadata.format.bitsPerSample ?? 16,
        sampleRate: audioMetadata.format.sampleRate ?? 44100,
    }
}

// All monotonic timestamps
let audioStart: number | null = null
let timePaused = 0
let lastPause = 0

export const seek = (seekTo: number) => {
    const wasPlaying = playing()
    if(wasPlaying) stopAudio()
    startAudio(seekTo)
    if(wasPlaying == false) pauseAudio()
}

export const getAudioStatus = (): AudioStatus => ({
    playing: playing(),
    paused: paused(),
    loop,
    volume,
    seek: audioStart ? (performance.now() - audioStart) - timePaused : 0
})

export const hasAudioFile = () => audioMetadata != null && uploadedFileName != null

export const getAudioInfo = (): AudioFileInfo => (hasAudioFile() ? {
    id: 'playing',
    fileName: uploadedFileName ?? 'None',
    title: audioMetadata?.common.title ?? 'No title',
    artist: audioMetadata?.common.artist ?? 'No artist',
    duration: (audioMetadata?.format.duration ?? 0) * 1000
} : {
    id: 'none',
    fileName: 'No file',
    title: 'No file',
    artist: 'No file',
    duration: 0
})

const audioEnd = () => {
    speaker?.close(loop)
    audio?.unpipe()
    audio?.destroy()
    if (loop) {
        audioStart = performance.now()
        speaker = new Speaker(getSpeakerSettings())
        audio = createReadStream(playingFile)
        audio.pipe(speaker)
        audio.addListener('end', audioEnd)
    } else {
        audioStart = null
        audio = null
        speaker = null
    }

    timePaused = 0
    lastPause = 0
    sendSyncData(audioStatusKey, getAudioStatus())
}

export const startAudio = (startAt?: number) => {
    if(hasAudioFile() == false) throw `Can not play audio when no file is set`
    if(playing() == true) return

    const bitsPerSample = audioMetadata?.format.bitsPerSample ?? 16
    const sampleRate = audioMetadata?.format.sampleRate ?? 44100
    const bytesPerSecond = (bitsPerSample / 8) * sampleRate
    const startAtSeconds = (startAt ?? 0) / 1000

    if (paused() == true) timePaused += performance.now() - lastPause
    else audioStart = performance.now() - (startAt ?? 0)

    if(speaker == null) speaker = new Speaker(getSpeakerSettings())
    if(audio == null) audio = createReadStream(playingFile, { start: Math.floor(startAtSeconds * bytesPerSecond) })
    audio.pipe(speaker)
    audio.addListener('end', audioEnd)
}

export const pauseAudio = () => {
    lastPause = performance.now()
    audio?.unpipe()
    speaker?.close(false)
    speaker = null
}

export const stopAudio = () => {
    audioStart = null
    timePaused = 0
    lastPause = 0

    audio?.unpipe()
    audio?.emit('end', true)
    audio?.removeListener('end', audioEnd)
}

export const setFile = async (fileName: string, metadata: IAudioMetadata, fileData: Buffer) => {
    const wasPlaying = playing()
    if (wasPlaying) stopAudio()

    uploadedFileName = fileName
    audioMetadata = metadata
    await writeFile(originalFile, fileData)
    await exec(`${ffmpeg} -i ${originalFile} -y -f s16le -acodec pcm_s16le ${playingFile}`)

    if (wasPlaying) startAudio()
}

export const unsetFile = async () => {
    if (playing()) stopAudio()
    await writeFile(playingFile, '')
    await writeFile(originalFile, '')
    uploadedFileName = null
    audioMetadata = null
}