import { SoundFile } from "./soundFiles"

export const filePlayerKey = 'filePlayer'
export type PlayingState = 'playing' | 'paused' | 'stopped'

export interface FilePlayerState {
    playingState: PlayingState,
    loop: boolean,
    seekPosition: number,
    playingFile: SoundFile | null
}