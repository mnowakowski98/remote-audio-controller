import { NavLink, Route, Routes } from 'react-router'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'

import useLocalStorage from './hooks/useLocalStorage'

import SettingsContext, { defaultSettings, type Settings } from './settingsContext'
import FilePlayerContext from './filePlayer/filePlayerContext'
import SoundFilesContext from './soundFiles/soundFilesContext'
import SettingsComponent from './settings/settings'

import classes from './App.module.scss'
import { serverInfoKey, type ServerInfo } from './models/serverInfo'

export default function App() {
  const settingsStorage = useLocalStorage<Settings>('settings')
  if (settingsStorage.value == null) settingsStorage.setValue(defaultSettings)
  const appSettings = settingsStorage.value ?? defaultSettings

  const validateServer = useQuery({
    queryKey: [serverInfoKey],
    queryFn: async () => {
      const response = await fetch(new URL('/api/serverinfo', appSettings.hostUrl))
      const data = await response.json() as ServerInfo
      const errMessage = 'Server is invalid'
      if (data.appname != 'remote-audio-controller') throw errMessage
      if (data.version != '0.0.0') throw errMessage
      return true
    }
  })

  const serverIsValid = validateServer.isPending == false && validateServer.error == null
  const settingsComponent = <SettingsComponent
    state={appSettings}
    onUpdate={(settings) => {
      settingsStorage.setValue(settings)
      validateServer.refetch()
    }}
    isSaving={validateServer.isPending}
  />

  return <SettingsContext value={{ hostUrl: new URL('./api/', appSettings.hostUrl) }}>
    <div className={classes.app}>
      <nav className={classes.navbar}>
        <NavLink to='/fileplayer'>File player</NavLink>
        <NavLink to='/soundfiles'>Sound files</NavLink>
        <NavLink to='/settings'>Settings</NavLink>
      </nav>

      <div className={classes.page}>
        <Toaster />
        {serverIsValid == false && <div className={classes.invalidServer}>
          <h3>{validateServer.isPending == true ? 'Checking server' : 'Server is invalid'}</h3>
          <hr />
          {settingsComponent}
        </div>}
        {serverIsValid == true && <Routes>
          <Route path='fileplayer' element={<FilePlayerContext />} />
          <Route path='soundfiles' element={<SoundFilesContext />} />
          <Route path='settings' element={settingsComponent}/>
        </Routes>}
      </div>
    </div>
  </SettingsContext>
}
