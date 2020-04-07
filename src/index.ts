'use strict'

import 'reflect-metadata'
import * as Hapi from '@hapi/hapi'
import { Request } from '@hapi/hapi'
import api from './api/api'
import db from './db'
import Boom from '@hapi/boom'
import UserService from './api/User/UserService'
import socket from './socket'
import { logger } from './api/Log/LogEntity'
import { User } from './api/User/UserEntity'
import config from './config/config'

const init = async () => {

    const server = new Hapi.Server({
        port: config.port,
        host: config.apiHost,
        routes: {
            cors: true,
            validate: {
                failAction: async (request, h, err) => {
                    if (err) {
                        if (process.env.NODE_ENV === 'production') {
                            // In prod, log a limited error message and throw the default Bad Request error.
                            console.error('ValidationError:', err.message)
                            throw Boom.badRequest(`Invalid request payload input`)
                        } else {
                            // During development, log and respond with the full error.
                            console.error(err)
                            throw err
                        }
                    }
                }
            }
        }
    })

    await server.register(require('./plugins/authentication/authentication'))

    server.auth.strategy('twitter-basic', 'twitter-basic', {
        async validate(request: Request, accessToken: string, accessTokenSecret: string) {
            let isValid = true

            const userService = new UserService()

            let user = await userService.getInfoFromTwitterAndSave(accessToken, accessTokenSecret)

            return { isValid, credentials: user }
        }
    })

    api.addRoutes(server)

    await server.start()

    await socket.start(server)

    await db.start()

    server.events.on('response', (request) => {
        const user = request.auth.credentials as User

        const response: any = request.response as any

        logger(response.statusCode !== 500 ? 'info' : 'error', 'server', 'request', {
            params: request.params,
            query: request.query,
            payload: request.payload,
            headers: request.headers,
            response: {
                statusCode: response.statusCode,
                data: response.statusCode !== 200 ? response.source : undefined
            },
            error: response._error ? {
                data: response._error.data,
                stack: response._error.stack,
                message: response._error.message
            } : undefined
        }, request.route.path, user)
    })

    console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {
    logger('error', 'server', 'unhandledRejection', err)
    console.error(err)
    process.exit(1)
})

init().then()