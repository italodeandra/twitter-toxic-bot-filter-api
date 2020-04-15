import config from '../config'
import winston, { LogEntry, Logger } from 'winston'

const logger = winston.createLogger({
    format: winston.format.json(),
})

if (config.env !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}

export default function log(entry: LogEntry): Logger {
    return logger.log(entry)
}
