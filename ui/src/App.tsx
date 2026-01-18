import { Route, Routes } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import SettingsContext, { defaultSettings, type Settings } from './settingsContext';
import useLocalStorage from './hooks/useLocalStorage';
import FilePlayerContext from './filePlayer/filePlayerContext';
import SoundFilesContext from './soundFiles/soundFilesContext';

import classes from './App.module.scss'
import publicKeyPath from './assets/server.public.txt'
import { algorithm } from './models/validate';


export default function App() {
  const settingsStorage = useLocalStorage<Settings>('settings')
  if (settingsStorage.value == null) settingsStorage.setValue(defaultSettings)
  const appSettings = settingsStorage.value ?? defaultSettings

  // const validation = useQuery({
  //   queryKey: ['validation'],
  //   queryFn: async () => {
  //     const publicKey = await (await fetch(publicKeyPath)).bytes()

  //     console.log(publicKey)
  //     const message = 'remote-audio-controller'
  //     const buffer = new Uint8Array(message.length)
  //     for (let i = 0; i < message.length; i++) buffer[i] = message.charCodeAt(i)
  //     const key = await crypto.subtle.importKey('raw', publicKey, algorithm, false, ['encrypt', 'decrypt'])
  //     const response = await fetch(new URL('./server-validate', appSettings.hostUrl), {
  //       method: 'POST',
  //       body: await crypto.subtle.encrypt(algorithm, key, buffer)
  //     })

  //     const data = await response.bytes()
  //     const responseMessage = await crypto.subtle.decrypt(algorithm, key, data)
  //     console.log(responseMessage)
  //   }
  // })

  if (validation.isLoading == true) return 'Loading'
  if (validation.error != null) return validation.error.message

  return <SettingsContext value={appSettings}>
    <div className={classes.app}>
      <nav className={classes.navbar}>
        <a href="/fileplayer">File Player</a>
        <a href="/soundfiles">Sound Files</a>
        <a href="/settings">Settings</a>
      </nav>

      <div className={classes.page}>
        <Toaster />
        <Routes>
          <Route path='fileplayer' element={<FilePlayerContext />} />
          <Route path='soundfiles' element={<SoundFilesContext />} />
        </Routes>
      </div>
    </div>
  </SettingsContext>
}
