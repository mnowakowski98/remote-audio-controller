export const soundFileKey = 'soundFiles'

export interface SoundFile {
    id: string,
    name: string,
    title: string,
    artist: string,
    album: string,
    durationMs: number,
    thumbnail?: string
}