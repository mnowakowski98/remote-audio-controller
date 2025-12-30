export const filePlayerKey = 'filePlayer'
export type PlayingState = 'playing' | 'paused' | 'stopped'

export interface FilePlayerState {
    playingState: PlayingState,
    loop: boolean,
    seekPosition: number,
    playingFile: {
        title: string,
        artist: string,
        durationMs: number
    } | null
}