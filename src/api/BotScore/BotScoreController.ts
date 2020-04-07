import { Controller, Get } from '../../decorators/Controller'
import { Request } from '@hapi/hapi'
import Botometer from 'node-botometer-rapid-api'
import config from '../../config/config'
import Joi from '@hapi/joi'

@Controller('/bot-score', true)
export default class BotScoreController {

    @Get({
        validate: {
            query: Joi.object({
                names: Joi.string().required(),
            }).options({ stripUnknown: true })
        }
    })
    async get(request: Request) {
        const namesString = request.query.names as string
        const names = namesString.split(',')

        const b = new Botometer({
            consumer_key: config.twitterConsumerApiKey,
            consumer_secret: config.twitterConsumerApiSecretKey,
            x_rapid_api_host: config.botometerApiHost,
            x_rapid_api_key: config.botometerApiKey,
            app_only_auth: true,
            rate_limit: 0,
            log_progress: false,
            include_user: false,
            include_timeline: false,
            include_mentions: false
        })

        let botScores: any = await new Promise((resolve) => {
            b.getBatchBotScores(names, resolve)
        })

        botScores = botScores.map((bs: any) => ({
            name: bs.user.screen_name,
            score: bs.botometer.cap.universal * 100
        }))

        return botScores
    }

}