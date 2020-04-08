import { Controller, Post } from '../../decorators/Controller'
import Joi from '@hapi/joi'
import { Request } from '@hapi/hapi'
import Twitter from 'twitter-lite'
import config from '../../config'
import { User } from '../User/UserEntity'

@Controller('/mute')
export default class MuteController {

    @Post({
        validate: {
            payload: Joi.object({
                names: Joi.array().items(Joi.string()).min(1).required()
            }).options({ stripUnknown: true })
        },
        auth: true
    })
    async mute(request: Request): Promise<{ message: string }> {
        const { names }: { names: string[] } = request.payload as any
        const user = request.auth.credentials as User

        const client = new Twitter({
            consumer_key: config.twitterConsumerApiKey,
            consumer_secret: config.twitterConsumerApiSecretKey,
            access_token_key: user.accessToken,
            access_token_secret: user.accessTokenSecret
        })

        for (let name of names) {
            const res = await client.post('mutes/users/create', {
                screen_name: name
            })

            console.log(res)
        }

        return { message: 'Muted successfully' }
    }

}