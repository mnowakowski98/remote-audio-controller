import { createContext } from 'react'

export const themeSettingsKey = 'theme'

interface ThemeSemantics {
    primary: string,
    secondary: string,
    highlight: string,
    warning: string,
    error: string
}

interface Theme {
    backgroundColors: ThemeSemantics
}

export default createContext<Theme | null>(null)