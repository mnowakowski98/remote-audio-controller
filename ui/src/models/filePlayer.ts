import { type SoundFile } from './soundFiles'

export const filePlayerKey = 'filePlayer'
export type PlayingState = 'playing' | 'paused' | 'stopped' | 'unloaded'

export interface FilePlayerState {
    playingState: PlayingState
    loop: boolean
    volume: number
    seekPosition: number
    playingFile: SoundFile | null
}