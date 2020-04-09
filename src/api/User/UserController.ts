import { Controller, Post } from '../../decorators/Controller'
import { Request } from '@hapi/hapi'
import Joi from '@hapi/joi'
import { User } from './UserEntity'
import Twitter from 'twitter-lite'
import config from '../../config'
import Boom from '@hapi/boom'
import UserService from './UserService'
import Autowired from '../../decorators/Autowired'

@Controller('/user')
export default class UserController {

    @Autowired
    userService!: UserService

    @Post('/auth-start')
    async authStart(): Promise<{ oauthToken: string, oauthTokenSecret: string }> {
        const client = new Twitter({
            consumer_key: config.twitterConsumerApiKey,
            consumer_secret: config.twitterConsumerApiSecretKey
        })

        const {
            oauth_token: oauthToken,
            oauth_token_secret: oauthTokenSecret
        } = await client.getRequestToken(config.webUrl)

        if (!oauthToken || !oauthTokenSecret) {
            throw Boom.internal('No oauthToken or no oauthTokenSecret')
        }

        return { oauthToken, oauthTokenSecret }
    }

    @Post({
        path: '/auth-finish',
        validate: {
            payload: Joi.object({
                oauthToken: Joi.string().required(),
                oauthTokenSecret: Joi.string().required(),
                oauthVerifier: Joi.string().required()
            }).options({ stripUnknown: true })
        }
    })
    async authFinish(request: Request): Promise<User> {
        const { oauthToken, oauthTokenSecret, oauthVerifier } = request.payload as any

        const app = new Twitter({
            consumer_key: config.twitterConsumerApiKey,
            consumer_secret: config.twitterConsumerApiSecretKey
        })

        const {
            oauth_token: accessToken,
            oauth_token_secret: accessTokenSecret
        } = await app.getAccessToken({
            key: oauthToken,
            secret: oauthTokenSecret,
            verifier: oauthVerifier
        })

        return await this.userService.getInfoFromTwitterAndSave(accessToken, accessTokenSecret)
    }

}