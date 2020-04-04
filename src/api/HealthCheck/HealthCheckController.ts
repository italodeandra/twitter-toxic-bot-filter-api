import { Controller, ControllerType, Get } from '../../decorators/Controller'

@Controller('/health-check')
export default class HealthCheckController extends ControllerType {

    @Get()
    healthCheck() {
        return {
            now: new Date()
        }
    }

}