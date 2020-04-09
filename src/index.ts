'use strict'

import 'reflect-metadata'
import * as Hapi from '@hapi/hapi'
import { Request } from '@hapi/hapi'
import api from './api/api'
import db from './db'
import Boom from '@hapi/boom'
import UserService from './api/User/UserService'
import socket from './socket'
import { User } from './api/User/UserEntity'
import config from './config'
import { logError, logInfo } from './utils/log'

const init = async () => {

    const server = new Hapi.Server({
        port: config.port,
        host: config.apiHost,
        routes: {
            cors: true,
            validate: {
                failAction: async (request, h, err) => {
                    if (err) {
                        logError({
                            context: 'server',
                            message: 'ValidationError',
                            error: err,
                            path: request.route.path,
                            params: request.params,
                            query: request.query,
                            payload: request.payload,
                        })
                        if (process.env.NODE_ENV === 'production') {
                            throw Boom.badRequest(`Invalid request payload input`)
                        } else {
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

        if (response.statusCode >= 400 && !response._error.data?.noLog) {
            logError({
                context: 'request',
                path: request.route.path,
                params: request.params,
                query: request.query,
                payload: request.payload,
                user,
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
            })
        }
    })

    logInfo({ message: `Server running on ${server.info.uri}` })
}

process.on('unhandledRejection', (err) => {
    logError({
        context: 'server',
        event: 'unhandledRejection',
        error: err
    })
    process.exit(1)
})

init().then()