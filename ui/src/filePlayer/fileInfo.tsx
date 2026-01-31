import { getDurationString } from '../hooks/getDurationString'
import type { FilePlayerState } from '../models/filePlayer'

import classes from './fileInfo.module.scss'

export default function FileInfo(props: { state: FilePlayerState }) {
    return <div className={classes.fileInfo}>
        {props.state.playingFile == null && <div className={classes.noFile}>No file loaded</div>}
        {props.state.playingFile != null && <div>
            <h3>Playing now</h3>
            {props.state.playingFile.cover != null && <>
                <img className={classes.albumArt} src={props.state.playingFile.cover.toString()} />
                <hr />
            </>}
            <div className={classes.common}>
                <div>File name: {props.state.playingFile.name}</div>
                <div>Title: {props.state.playingFile.title}</div>
                <div>Artist: {props.state.playingFile.artist}</div>
                <div>Album: {props.state.playingFile.album}</div>
                <div style={{gridColumn: 'span 2'}}>Length: {getDurationString(props.state.playingFile.durationMs)}</div>
            </div>
        </div>}
    </div>
}