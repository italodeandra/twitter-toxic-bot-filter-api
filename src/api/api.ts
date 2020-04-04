import { Server } from '@hapi/hapi'
import HealthCheckController from './HealthCheck/HealthCheckController'
import { ControllerType } from '../decorators/Controller'
import FeedbackController from './Feedback/FeedbackController'

const routes = [
    ...(HealthCheckController as ControllerType).routes!,
    ...(FeedbackController as ControllerType).routes!
]

export default {
    addRoutes(server: Server) {
        server.route(routes)
    }
}