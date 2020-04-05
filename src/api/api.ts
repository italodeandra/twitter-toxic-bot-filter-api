import { Server } from '@hapi/hapi'
import './User/UserController'
import './Feedback/FeedbackController'
import './HealthCheck/HealthCheckController'
import './TweetTrap/TweetTrapController'

export const routes: any = []

export default {
    addRoutes(server: Server) {
        server.route(routes.map((route: any) => {
            delete route.controlled
            return route
        }))
    }
}