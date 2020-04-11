import Boom from '@hapi/boom'

export default function handleTwitterError(error: any) {
    switch (error.errors?.[0]?.code) {
        case 220:
            return Boom.unauthorized('Your credentials from Twitter do not allow access to this resource') // already not logged
        case 88:
            return Boom.tooManyRequests('You have reached Twitter API\'s request limit. Wait before trying again.', { noLog: true })
        case 187:
            return Boom.conflict('Tweet duplicated. You can\'t tweet the same thing more than once.', { noLog: true })
        case 144:
            return Boom.notFound('Tweet not found', { noLog: true })
        default:
            return error
    }
}