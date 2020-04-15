import { createConnection } from 'typeorm'
import config from './config'
import log from './utils/log'

const db = {
    connected: false,
    async start() {
        try {
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
        } catch (error) {
            log({ level: 'error', message: 'Can\'t connect to the database', error })
        }
    }
}

export default db