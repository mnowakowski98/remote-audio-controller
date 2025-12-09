import { useContext } from 'react'
import { useMutation } from '@tanstack/react-query'

import Button from 'react-bootstrap/Button'

import settingsContext from '../settingsContext'

interface ClearButtonProps {
    hasFile: boolean
}

export default function ClearButton(props: ClearButtonProps) {
    const url = useContext(settingsContext).hostUrl
    
    const clearFile = useMutation({
        mutationFn: async () => (await fetch(url, { method: 'DELETE' })),
    })

    return <Button
        type='button'
        disabled={clearFile.isPending == true || props.hasFile == false}
        onClick={() => clearFile.mutate()}>
        Clear file
    </Button>
}