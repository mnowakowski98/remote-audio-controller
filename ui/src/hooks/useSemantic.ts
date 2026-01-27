import { useRef } from 'react'

export default function useSemantic(semantic: string) {
    const root = useRef(document.getElementById('root'))
    const style = getComputedStyle(root.current!)
    const background = style.getPropertyValue(`--background-${semantic}`)
    const text = style.getPropertyValue(`--text-color-${semantic}`)
    return {
        background,
        text
    }
}