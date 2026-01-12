import FilesTable from './filesTable'
import FileUploader from './fileUploader'

export default function SoundFiles() {
    return <div>
        <div>
            <FilesTable showDeleteButtons={true} />
        </div>

        <hr />
        <div>
            <FileUploader />
        </div>
    </div>
}