import FilesTable from './filesTable'
import FileUploader from './fileUploader'

import type { SoundFile } from '../models/soundFiles'

import classes from './soundFiles.module.scss'

export default function SoundFiles(props: { state: SoundFile[] }) {
    return <div className={classes.soundFiles}>
        <div className={classes.fileUploader}>
            <FileUploader />
            <hr />
        </div>
        <div className={classes.filesTable}>
            <FilesTable state={props.state} showDeleteButtons={true} />
        </div>
    </div>
}