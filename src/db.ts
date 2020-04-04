import { createConnection } from 'typeorm'

export default {
    async start() {
        await createConnection({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'root',
            database: 'twitter_toxic_bot_filter',
            entities: [
                __dirname + '/api/**/*Entity.ts'
            ],
            synchronize: true,
            logging: false
        })
    }
}