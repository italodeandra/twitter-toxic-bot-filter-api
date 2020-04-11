import { Controller, Get, Post } from '../../decorators/Controller'
import Boom from '@hapi/boom'

@Controller('/{p*}')
export default class HealthCheckController {


    @Post()
    @Get()
    notFound() {
        throw Boom.notFound('Resource not found', { noLog: true })
    }

}