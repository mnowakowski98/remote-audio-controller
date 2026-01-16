// This isn't a hook but I'm not making a new folder for shared functions
export const getDurationString = (durationMs: number) => {
    const date = new Date(0, 0, 0, 0, 0, 0, durationMs)
    return date.toTimeString().substring(0, 8)
}