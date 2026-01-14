import { useRef } from 'react'

export default function useProperty(semantic: string) {
    const root = useRef(document.getElementById('root'))
    const style = getComputedStyle(root.current!)
    const background = style.getPropertyValue(`--backgroundcolor-${semantic}`)
    const text = style.getPropertyValue(`--textcolor-${semantic}`)
    return {
        background,
        text
    }
}