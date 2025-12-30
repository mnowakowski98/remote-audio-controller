import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Route, Routes } from 'react-router';

import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import Settings from './settings/settings'
import SettingsContext, { type Settings as SettingsType } from './settingsContext'
import FilePlayerContext from './filePlayer/filePlayerContext';
import SoundFilesContext from './soundFiles/soundFilesContext';

export default function App() {
  const settingsString = localStorage.getItem('settings')
  const [settings, setSettings] = useState<SettingsType>(settingsString ? JSON.parse(settingsString) : {
    hostUrl: ''
  })

  const isValidHost = useQuery({
    queryKey: ['isValidHost'],
    queryFn: async () => {
      const data = await fetch(settings.hostUrl)
      return data.text()
    }
  })

  const ready = isValidHost.isError == false
    && isValidHost.isLoading == false
    && isValidHost.data == 'remote-audio-controller-server'

  const settingsComponent = <Settings onUpdate={(newSettings) => {
    setSettings(newSettings)
    localStorage.setItem('settings', JSON.stringify(newSettings))
  }} />

  return <SettingsContext value={settings}>
    <Navbar className='bg-primary mb-3'>
      <Container>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link className='text-light' href="/fileplayer">File Player</Nav.Link>
            <Nav.Link className='text-light' href="/soundfiles">Sound Files</Nav.Link>
            <Nav.Link className='text-light' href="/settings">Settings</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

    {ready == false && <>
      <div className='text-center'>Invalid host url</div>
      {settingsComponent}
    </>}
    {ready && <Routes>
      <Route path='fileplayer' element={<FilePlayerContext />} />
      <Route path='soundfiles' element={<SoundFilesContext />} />
      <Route path='settings' element={settingsComponent} />
    </Routes>}
  </SettingsContext>
}
