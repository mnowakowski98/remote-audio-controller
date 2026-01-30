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
  if (settingsStorage.value.current == null) settingsStorage.setValue(defaultSettings)
  const appSettings = settingsStorage.value

  const validate = useQuery({
    queryKey: [serverInfoKey],
    queryFn: async () => {
      const response = await fetch(new URL('./api/serverinfo', appSettings.current!.hostUrl))
      const data = await response.json() as ServerInfo
      if (data.appname != 'remote-audio-controller') throw new Error()
      if (data.version != '0.0.0') throw new Error()
      return true
    },
    retry: false
  })

  const settingsComponent = <SettingsComponent
    state={appSettings.current!}
    onUpdate={(settings) => {
      settingsStorage.setValue(settings)
      validate.refetch()
    }}
  />

  return <SettingsContext value={{ hostUrl: new URL('./api/', appSettings.current!.hostUrl) }}>
    <div className={classes.app}>
      <nav className={classes.navbar}>
        <NavLink to='/fileplayer'>File player</NavLink>
        <NavLink to='/soundfiles'>Sound files</NavLink>
        <NavLink to='/settings'>Settings</NavLink>
      </nav>

      <div className={classes.page}>
        <Toaster />
        {validate.isPending == true && <div className={classes.invalidServer}>Checking server</div>}
        {validate.isSuccess == false && <div className={classes.invalidServer}>
          <h3>Server is invalid</h3>
          <hr />
          {settingsComponent}
        </div>}
        {validate.isSuccess == true && validate.isPending == false && <Routes>
          <Route path='fileplayer' element={<FilePlayerContext />} />
          <Route path='soundfiles' element={<SoundFilesContext />} />
          <Route path='settings' element={settingsComponent}/>
        </Routes>}
      </div>
    </div>
  </SettingsContext>
}
