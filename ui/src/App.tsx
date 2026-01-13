import { Route, Routes } from 'react-router';

import classes from './App.module.scss'

import FilePlayerContext from './filePlayer/filePlayerContext';
import SoundFilesContext from './soundFiles/soundFilesContext';
import SettingsContext from './settingsContext';

export default function App() {
  return <SettingsContext value={{hostUrl: new URL('http://localhost/')}}>
    <nav className={classes.navbar}>
      <a href="/fileplayer">File Player</a>
      <a href="/soundfiles">Sound Files</a>
      <a href="/settings">Settings</a>
    </nav>

    <div className={classes.page}>
      <Routes>
        <Route path='fileplayer' element={<FilePlayerContext />} />
        <Route path='soundfiles' element={<SoundFilesContext />} />
      </Routes>
    </div>
  </SettingsContext>
}
