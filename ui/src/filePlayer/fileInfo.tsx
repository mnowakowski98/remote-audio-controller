import type { FilePlayerState } from '../models/filePlayer'

import classes from './fileInfo.module.scss'

export default function FileInfo(props: { state: FilePlayerState }) {
    return <div className={classes.fileInfo}>
        {props.state.playingFile == null && <span>No File loaded</span>}
        {props.state.playingFile != null && <table>
            <thead>
                <tr>
                    <td>Title</td>
                    <td>Artist</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{props.state.playingFile.title}</td>
                    <td>{props.state.playingFile.artist}</td>
                </tr>
            </tbody>
        </table>}
    </div>
}