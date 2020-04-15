import winston, { LogEntry, Logger } from 'winston'

const logger = winston.createLogger({
    format: winston.format.json(),
})

logger.add(new winston.transports.Console({
    format: winston.format.json()
}))

export default function log(entry: LogEntry): Logger {
    return logger.log(entry)
}
