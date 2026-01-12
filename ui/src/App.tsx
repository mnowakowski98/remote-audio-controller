import { Route, Routes } from 'react-router';

import './App.css'

import FilePlayerContext from './filePlayer/filePlayerContext';
import SoundFilesContext from './soundFiles/soundFilesContext';
import SettingsContext from './settingsContext';

export default function App() {
  return <SettingsContext value={{hostUrl: new URL('http://localhost/')}}>
    <nav className="navbar">
      <a href="/fileplayer">File Player</a>
      <a href="/soundfiles">Sound Files</a>
      <a href="/settings">Settings</a>
    </nav>

    <Routes>
      <Route path='fileplayer' element={<FilePlayerContext />} />
      <Route path='soundfiles' element={<SoundFilesContext />} />
    </Routes>
  </SettingsContext>
}
