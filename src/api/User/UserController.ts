import { Controller, Get, Post } from '../../decorators/Controller'
import { Request } from '@hapi/hapi'
import Joi from '@hapi/joi'
import { User } from './UserEntity'
import Twitter from 'twitter-lite'
import config from '../../config'
import UserService from './UserService'
import Autowired from '../../decorators/Autowired'
import jwt from 'jsonwebtoken'
import handleTwitterError from '../../utils/handleTwitterError'

@Controller('/user')
export default class UserController {

    @Autowired
    userService!: UserService

    @Post('/auth-start')
    async authStart(): Promise<{
        oauthToken: string,
        oauthTokenSecret: string,
        twitterAuth: string | undefined
    }> {
        const client = new Twitter({
            consumer_key: config.twitterConsumerApiKey,
            consumer_secret: config.twitterConsumerApiSecretKey
        })
        let callbackUrl = config.webUrl
        let twitterAuth: string | undefined

        if (config.env === 'test') {
            callbackUrl = `http://${config.apiHost}:${config.port}/user/auth-callback`
        }

        try {
            const {
                oauth_token: oauthToken,
                oauth_token_secret: oauthTokenSecret
            } = await client.getRequestToken(callbackUrl)

            if (config.env === 'test') {
                twitterAuth = config.twitterAuthenticateUrl(oauthToken)
            }

            return { oauthToken, oauthTokenSecret, twitterAuth }
        } catch (error) {
            throw handleTwitterError(error)
        }
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
    async authFinish(request: Request): Promise<{
        user: User
        token: string
    }> {
        const { oauthToken, oauthTokenSecret, oauthVerifier } = request.payload as any

        const app = new Twitter({
            consumer_key: config.twitterConsumerApiKey,
            consumer_secret: config.twitterConsumerApiSecretKey
        })

        let accessToken, accessTokenSecret

        const res = await app.getAccessToken({
            key: oauthToken,
            secret: oauthTokenSecret,
            verifier: oauthVerifier
        })
        accessToken = res.oauth_token
        accessTokenSecret = res.oauth_token_secret

        const user = await this.userService.getInfoFromTwitterAndSave(accessToken, accessTokenSecret)
        const token = jwt.sign({ id: user.id }, config.authSecret)

        return { user, token }
    }

    @Get('/auth-verify', true)
    async authVerify(request: Request): Promise<{
        user: User
        token: string
    }> {
        const { accessToken, accessTokenSecret } = await this.userService.getByCredentials(request.auth.credentials)

        const user = await this.userService.getInfoFromTwitterAndSave(accessToken, accessTokenSecret)
        const token = jwt.sign({ id: user.id }, config.authSecret)

        return { user, token }
    }

    @Get({
        path: '/auth-callback',
        validate: {
            query: Joi.object({
                oauth_token: Joi.string().required(),
                oauth_verifier: Joi.string().required()
            }).options({ stripUnknown: true })
        }
    }) // testing purposes
    authCallback(request: Request): {
        oauthToken: string,
        oauthTokenSecret: string,
        oauthVerifier: string
    } {
        const { oauth_token, oauth_verifier } = request.query as any

        return {
            oauthToken: oauth_token,
            oauthTokenSecret: '{{oauthTokenSecret}}',
            oauthVerifier: oauth_verifier
        }
    }

}