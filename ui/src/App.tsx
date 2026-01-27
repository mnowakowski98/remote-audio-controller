import { Route, Routes } from 'react-router'
import { Toaster } from 'react-hot-toast'

import useLocalStorage from './hooks/useLocalStorage'

import SettingsContext, { defaultSettings, type Settings } from './settingsContext'
import FilePlayerContext from './filePlayer/filePlayerContext'
import SoundFilesContext from './soundFiles/soundFilesContext'

import classes from './App.module.scss'
import SettingsComponent from './settings/settings'

export default function App() {
  const settingsStorage = useLocalStorage<Settings>('settings')
  if (settingsStorage.value == null) settingsStorage.setValue(defaultSettings)
  const appSettings = settingsStorage.value ?? defaultSettings

  return <SettingsContext value={appSettings}>
    <div className={classes.app}>
      <nav className={classes.navbar}>
        <a href="/fileplayer">File player</a>
        <a href="/soundfiles">Sound files</a>
        <a href="/settings">Settings</a>
      </nav>

      <div className={classes.page}>
        <Toaster />
        <Routes>
          <Route path='fileplayer' element={<FilePlayerContext />} />
          <Route path='soundfiles' element={<SoundFilesContext />} />
          <Route path='settings' element={
            <SettingsComponent
              state={appSettings}
              onUpdate={(settings) => settingsStorage.setValue(settings)}
            />
          }/>
        </Routes>
      </div>
    </div>
  </SettingsContext>
}
