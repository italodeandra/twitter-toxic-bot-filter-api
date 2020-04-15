import { Controller, Get, Post } from '../../decorators/Controller'
import { Request } from '@hapi/hapi'
import { User } from '../User/UserEntity'
import Twitter from 'twitter-lite'
import config from '../../config'
import { TweetTrap } from './TweetTrapEntity'
import Joi from '@hapi/joi'
import Boom from '@hapi/boom'
import { Socket } from 'socket.io'
import { SocketOn } from '../../decorators/SocketOn'
import isBigInt from '../../utils/isBigInt'
import Autowired from '../../decorators/Autowired'
import UserService from '../User/UserService'
import handleTwitterError from '../../utils/handleTwitterError'
import TwitterStreamService from '../TwitterStream/TwitterStreamService'
import log from '../../utils/log'

@Controller('/tweet-trap', true)
export default class TweetTrapController {

    @Autowired
    userService!: UserService

    @Autowired
    twitterStream!: TwitterStreamService

    @Post({
        validate: {
            payload: Joi.object({
                text: Joi.string().max(280).required(),
            }).options({ stripUnknown: true })
        }
    })
    async tweet(request: Request): Promise<TweetTrap> {
        const tweetTrapData = request.payload as TweetTrap
        const user = await this.userService.getByCredentials(request.auth.credentials)

        const client = new Twitter({
            consumer_key: config.twitterConsumerApiKey,
            consumer_secret: config.twitterConsumerApiSecretKey,
            access_token_key: user.accessToken,
            access_token_secret: user.accessTokenSecret
        })

        try {
            const result = await client.post('statuses/update', {
                status: tweetTrapData.text
            })
            tweetTrapData.id = result.id_str
            tweetTrapData.createdBy = user
        } catch (error) {
            throw handleTwitterError(error)
        }

        let tweetTrap = await TweetTrap.create(tweetTrapData)
        await tweetTrap.save()

        return tweetTrap
    }

    @Get({
        path: '/{id}',
        validate: {
            params: Joi.object({
                id: Joi.string().alphanum().custom(isBigInt, 'bigint').required()
            })
        }
    })
    async get(request: Request): Promise<TweetTrap> {
        const id = request.params.id

        const tweetTrap = await TweetTrap.findOne({ where: { id } })

        if (!tweetTrap) {
            throw Boom.notFound('Tweet not found', { noLog: true })
        }

        return tweetTrap
    }

    @Get()
    async list(request: Request): Promise<TweetTrap[]> {
        const user = await this.userService.getByCredentials(request.auth.credentials)

        return TweetTrap.find({
            relations: [ 'createdBy' ],
            where: { createdBy: user },
            take: 10,
            order: { id: 'DESC' }
        })
    }

    @Get({
        path: '/{id}/replies',
        validate: {
            params: Joi.object({
                id: Joi.string().alphanum().custom(isBigInt, 'bigint').required()
            })
        }
    })
    async getReplies(request: Request) {
        const id = request.params.id
        const user = await this.userService.getByCredentials(request.auth.credentials)

        const client = new Twitter({
            consumer_key: config.twitterConsumerApiKey,
            consumer_secret: config.twitterConsumerApiSecretKey,
            access_token_key: user.accessToken,
            access_token_secret: user.accessTokenSecret
        })

        let statuses: any[] = []

        try {
            statuses = await client.get('statuses/mentions_timeline', {
                // q: 'to:' + user.screenName,
                since_id: id,
                count: 800
            })
        } catch (error) {
            throw handleTwitterError(error)
        }

        return statuses
          .filter((t: any) => t.in_reply_to_status_id_str = id)
          .map((t: any) => ({
              id: t.id_str,
              text: t.text.replace(new RegExp(`^@${user.screenName} `, 'g'), ''),
              createdBy: {
                  id: t.user.id_str,
                  screenName: t.user.screen_name,
                  name: t.user.name,
                  profileImageUrl: t.user.profile_image_url_https
              },
              createdAt: new Date(t.created_at)
          }))
    }

    @SocketOn('subscribeTweetTrapReplies', true)
    async subscribeReplies(socket: Socket, id: string) {
        const user: User = (socket as any).user

        const prepareLog = {
            context: 'socket',
            api: 'TweetTrap',
            method: 'TweetTrapController.subscribeReplies',
            event: 'subscribeTweetTrapReplies',
            params: { id },
            user
        }

        socket.emit('tweetTrapReplyAutoSync', true)

        function handleStart() {
            socket.emit('tweetTrapReplyAutoSync', true)
            log({ ...prepareLog, level: 'info', message: 'stream started' })
        }

        function handleData(t: any) {
            log({ ...prepareLog, level: 'info', message: 'stream new data' })
            if (t.in_reply_to_status_id_str === id) {
                const tweet = {
                    id: t.id_str,
                    text: t.text.replace(new RegExp(`^@${user.screenName} `, 'g'), ''),
                    createdBy: {
                        id: t.user.id_str,
                        screenName: t.user.screen_name,
                        name: t.user.name,
                        profileImageUrl: t.user.profile_image_url_https.replace('normal.', '200x200.')
                    },
                    createdAt: new Date(t.created_at)
                }
                log({ ...prepareLog, level: 'info', message: 'stream new reply received', tweet })
                socket.emit('newTweetTrapReply', tweet)
            }
        }

        function handlePing() {
            socket.emit('tweetTrapReplyAutoSync', true)
            log({ ...prepareLog, level: 'info', message: 'stream ping' })
        }

        function handleError(error: any) {
            log({
                ...prepareLog,
                level: 'error',
                message: 'stream error',
                error: {
                    source: error.source,
                    status: error.status,
                    statusText: error.statusText
                }
            })
        }

        function handleEnd() {
            log({ ...prepareLog, level: 'info', message: 'stream end' })
            socket.emit('tweetTrapReplyAutoSync', false)
        }

        try {
            const stream = this.twitterStream
              .register(user, 'statuses/filter', {
                  track: '@' + user.screenName,
              })
              .on('start', handleStart)
              .on('data', handleData)
              .on('ping', handlePing)
              .on('error', handleError)
              .on('end', handleEnd)

            const removeListeners = () => {
                stream
                  .off('start', handleStart)
                  .off('data', handleData)
                  .off('ping', handlePing)
                  .off('error', handleError)
                  .off('end', handleEnd)
                socket.off('unsubscribeTweetTrapReplies', removeListeners)
                socket.off('disconnect', removeListeners)
                log({ ...prepareLog, level: 'info', message: 'stream terminated by the user' })
            }

            socket.on('disconnect', removeListeners)
            socket.on('unsubscribeTweetTrapReplies', removeListeners)
        } catch (error) {
            log({
                ...prepareLog,
                level: 'error',
                message: 'not able to stream',
                error
            })
        }
    }

}