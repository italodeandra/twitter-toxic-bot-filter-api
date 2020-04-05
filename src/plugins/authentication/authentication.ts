import { Request, ResponseToolkit, Server, ServerAuthScheme, ServerOptions } from '@hapi/hapi'
import Boom from '@hapi/boom'
import Hoek from '@hapi/hoek'

const internals: { implementation?: ServerAuthScheme } = {}

exports.plugin = {
    name: 'authentication',
    register(server: Server, _options: ServerOptions) {
        server.auth.scheme('twitter-basic', internals.implementation!)
    }
}

internals.implementation = function (server: Server, options: any) {

    Hoek.assert(options, 'Missing twitter basic auth strategy options')
    Hoek.assert(typeof options.validate === 'function', 'options.validate must be a valid function in twitter basic scheme')

    const settings = Hoek.clone(options)

    return {
        authenticate: async function (request: Request, h: ResponseToolkit) {

            const authorization = request.headers.authorization

            if (!authorization) {
                throw Boom.unauthorized(null, 'Bearer', settings.unauthorizedAttributes)
            }

            const parts = authorization.split(/\s+/)

            if (parts[0].toLowerCase() !== 'bearer') {
                throw Boom.unauthorized(null, 'Bearer', settings.unauthorizedAttributes)
            }

            if (parts.length !== 2) {
                throw Boom.badRequest('Bad HTTP authentication header format', 'Bearer')
            }

            let userObject
            try {
                userObject = JSON.parse(Buffer.from(parts[1], 'base64').toString())
            } catch (e) {
                throw Boom.badRequest('Bad HTTP authentication token format', 'Bearer')
            }
            // const sep = credentialsPart.indexOf(':')
            // if (sep === -1) {
            //     throw Boom.badRequest('Bad header internal syntax', 'Basic')
            // }

            // const username = credentialsPart.slice(0, sep)
            // const password = credentialsPart.slice(sep + 1)

            if (!userObject.accessToken) {
                throw Boom.unauthorized('HTTP authentication header missing accessToken', 'Bearer', settings.unauthorizedAttributes)
            }
            if (!userObject.accessTokenSecret) {
                throw Boom.unauthorized('HTTP authentication header missing accessTokenSecret', 'Bearer', settings.unauthorizedAttributes)
            }

            // if (!username &&
            //   !settings.allowEmptyUsername) {
            //     throw Boom.unauthorized('HTTP authentication header missing username', 'Basic', settings.unauthorizedAttributes)
            // }

            const { credentials, response } = await settings.validate(request, userObject.accessToken, userObject.accessTokenSecret, h)

            if (response !== undefined) {
                return h.response(response).takeover()
            }

            if (!credentials ||
              typeof credentials !== 'object') {
                throw Boom.badImplementation('Bad credentials object received for Twitter auth validation')
            }

            return h.authenticated({ credentials })
        }
    }
}