import { createContext } from 'react';

export const defaultSettings = {
    hostUrl: new URL('http://localhost/')
}

export type Settings = typeof defaultSettings

export default createContext<Settings>(defaultSettings)