import FileInfo from './fileInfo'
import PlayerControls from './playerControls'
import SeekBar from './seekBar'

import classes from './filePlayer.module.scss'

import type { FilePlayerState } from '../models/filePlayer'

export default function FilePlayer(props: {state: FilePlayerState}) {
    return <div className={classes.filePlayer}>
        <FileInfo state={props.state} />
        <div>
            <SeekBar />
            <PlayerControls state={props.state} />
        </div>
    </div>
}