import { Controller, Get } from '../../decorators/Controller'

@Controller('/')
export default class HealthCheckController {

    @Get()
    healthCheck() {
        return {
            now: new Date()
        }
    }

}