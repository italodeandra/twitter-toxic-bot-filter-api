import { Controller, Get } from '../../decorators/Controller'

@Controller('/health-check')
export default class HealthCheckController {

    @Get()
    healthCheck() {
        return {
            now: new Date()
        }
    }

}