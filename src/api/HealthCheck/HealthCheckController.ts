import { Controller, Get } from '../../decorators/Controller'

@Controller('/')
export default class HealthCheckController {

    @Get()
    healthCheck() {
        return {
            now: new Date()
        }
    }

    @Get('loaderio-2bd379dd68798a73786d0556e52ba92d/')
    loadTest() {
        return 'loaderio-2bd379dd68798a73786d0556e52ba92d'
    }

}