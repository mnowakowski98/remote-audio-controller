import useFilePlayerState from './useFilePlayerState'

export default function FileInfo() {
    const playerState = useFilePlayerState()

    if (playerState.isLoading) return 'Loading'
    if (playerState.isError) return playerState.error.message

    return <table>
        <thead>
            <tr>
                <td>Title</td>
                <td>Artist</td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{playerState.data?.playingFile?.title ?? '(No title)'}</td>
                <td>{playerState.data?.playingFile?.artist ?? '(No artist)'}</td>
            </tr>
        </tbody>
    </table>
}