import { getDurationString } from '../hooks/getDurationString'
import type { FilePlayerState } from '../models/filePlayer'

import classes from './fileInfo.module.scss'

export default function FileInfo(props: { state: FilePlayerState }) {
    return <div className={classes.fileInfo}>
        {props.state.playingFile == null && <div className={classes.noFile}>No File loaded</div>}
        {props.state.playingFile != null && <div>
            <h3>Playing Now</h3>
            {props.state.playingFile.thumbnail != null && <>
                <img className={classes.albumArt} src={props.state.playingFile.thumbnail} />
                <hr />
            </>}
            <div className={classes.common}>
                <div>File name: {props.state.playingFile.name}</div>
                <div>Title: {props.state.playingFile.title}</div>
                <div>Artist: {props.state.playingFile.artist}</div>
                <div>Album: {props.state.playingFile.album}</div>
                <div>Length: {getDurationString(props.state.playingFile.durationMs)}</div>
            </div>
        </div>}
    </div>
}