import { createConnection } from 'typeorm'
import config from './config'

const db = {
    connected: false,
    async start() {
        await createConnection({
            type: 'mysql',
            host: config.database.host,
            port: +config.database.port,
            username: config.database.username,
            password: config.database.password,
            database: config.database.database,
            entities: [
                __dirname + '/api/**/*Entity.*'
            ],
            synchronize: true,
            logging: false
        })
        db.connected = true
    }
}

export default db