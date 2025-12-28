import { useContext, useState } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

import type { Settings } from '../settingsContext'
import SettingsContext from '../settingsContext'

interface SettingsProps {
    onUpdate: (settings: Settings) => void
}

export default function Settings(props: SettingsProps) {
    const settings = useContext(SettingsContext)
    const [hostUrl, setHostUrl] = useState(settings.hostUrl.toString())

    const getSettings = (): Settings => ({
        hostUrl: new URL(hostUrl)
    })

    return <Container>
        <Row>
            <Col>
                <h3>Client configuration</h3>
                <Form.Text>Host URL</Form.Text>
                <InputGroup>
                    <Form.Control
                        type='text'
                        value={hostUrl}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setHostUrl(event.target.value)}
                    />
                    <Button onClick={() => props.onUpdate(getSettings())}>Set</Button>
                </InputGroup>

                <hr />
                <h3>Server configuration</h3>
                <Form.Text>Port</Form.Text>
                <InputGroup>
                    <Form.Control type='number' />
                </InputGroup>
            </Col>
        </Row>
    </Container>
}