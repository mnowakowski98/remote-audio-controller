import { Route, Routes } from 'react-router';
import { Toaster } from 'react-hot-toast';

import classes from './App.module.scss'

import FilePlayerContext from './filePlayer/filePlayerContext';
import SoundFilesContext from './soundFiles/soundFilesContext';
import SettingsContext from './SettingsContext';

export default function App() {
  return <SettingsContext value={{ hostUrl: new URL('http://localhost/') }}>
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
        </Routes>
      </div>
    </div>
  </SettingsContext>
}
