'use strict'

import * as Hapi from '@hapi/hapi'
import api from './api/api'
import 'reflect-metadata'
import db from './db'
import Boom from '@hapi/boom'

const init = async () => {

    const server = new Hapi.Server({
        port: 3001,
        host: '192.168.17.102',
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