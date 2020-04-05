'use strict'

import 'reflect-metadata'
import * as Hapi from '@hapi/hapi'
import { Request } from '@hapi/hapi'
import api from './api/api'
import db from './db'
import Boom from '@hapi/boom'
import UserService from './api/User/UserService'

const init = async () => {

    const server = new Hapi.Server({
        port: 3001,
        host: '0.0.0.0',
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

    await db.start()

    console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

init().then()