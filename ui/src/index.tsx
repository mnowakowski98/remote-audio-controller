import type { ServerInfo } from './models/serverInfo'

import classes from './index.module.scss'

export default function Index(props: { state: ServerInfo }) {
    const { appname, version } = props.state
    return <div className={classes.serverInfo}>
        <div>
            <div>{appname}</div>
            <div>{version}</div>
        </div>
    </div>
}