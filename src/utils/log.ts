import config from '../config'
import winston from 'winston'

const logger = winston.createLogger({
    format: winston.format.json(),
})

if (config.env !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}

export default logger.log
