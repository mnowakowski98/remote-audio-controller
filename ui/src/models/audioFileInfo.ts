export default interface AudioFileInfo {
    id: string | 'none',
    fileName: string,
    title: string,
    artist: string,
    duration: number
}

export const audioFileInfoKey = 'audioFileInfo'