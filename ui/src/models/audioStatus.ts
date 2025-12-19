export default interface AudioStatus {
    playing: boolean,
    paused: boolean,
    loop: boolean,
    volume: number,
    seek: number
}

export const audioStatusKey = 'audioStatus'
