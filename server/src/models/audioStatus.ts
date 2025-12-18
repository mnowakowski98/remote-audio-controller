export default interface AudioStatus {
    playing: boolean,
    paused: boolean,
    loop: boolean,
    volume: number
}

export const audioStatusKey = 'audioStatus'
export const audioSeekKey = 'audioSeek'