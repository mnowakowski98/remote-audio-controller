import type { FilePlayerState } from '../models/filePlayer'

import classes from './fileInfo.module.scss'

export default function FileInfo(props: { state: FilePlayerState }) {
    return <div className={classes.fileInfo}>
        {props.state.playingFile == null && <span>No File loaded</span>}
        {props.state.playingFile != null && <div>
            <div>File name: {props.state.playingFile.name}</div>
            <div>Title: {props.state.playingFile.title}</div>
            <div>Artist: {props.state.playingFile.artist}</div>
            <div>Album: {props.state.playingFile.album}</div>
            <div>Length: {props.state.playingFile.durationMs / 1000}</div>
        </div>}
    </div>
}