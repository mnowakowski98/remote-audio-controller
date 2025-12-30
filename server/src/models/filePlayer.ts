import { IAudioMetadata } from 'music-metadata'
import Speaker, { Stream } from 'speaker'

export interface PlayingFile {
    name: string,
    metadata: IAudioMetadata,
    audio: Stream.Readable | null,
    speaker: Speaker | null
}

export interface PlayerSettings {
    ffmpeg: string,
    originalFile: string,
    playingFile: string
}

export interface PlayerControls {
    loop: boolean
}

export interface SeekTimings {
    audioStart: number,
    lastPause: number,
    timePaused: number
}

export default interface FilePlayerState {
    audioPlaying: boolean,
    audioPaused: boolean,
    playerSettings: PlayerSettings,
    playingFile: PlayingFile | null,
    seekTimings: SeekTimings
}