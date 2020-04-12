import { Server } from '@hapi/hapi'

export const routes: any = []

require('./User/UserController')
require('./Feedback/FeedbackController')
require('./HealthCheck/HealthCheckController')
require('./TweetTrap/TweetTrapController')
require('./BotScore/BotScoreController')
require('./Mute/MuteController')
require('./NotFound/NotFoundController')

export default {
    addRoutes(server: Server) {
        server.route(routes.map((route: any) => {
            delete route.controlled
            return route
        }))
    }
}