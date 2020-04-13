import { createConnection } from 'typeorm'
import config from './config'

const db = {
    connected: false,
    async start() {
        await createConnection({
            url: config.databaseUrl,
            type: 'postgres',
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