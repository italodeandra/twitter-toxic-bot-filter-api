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
import { logger, prepareLogger } from '../Log/LogEntity'

@Controller('/tweet-trap', true)
export default class HealthCheckController {

    @Post({
        validate: {
            payload: Joi.object({
                text: Joi.string().max(280).required(),
            }).options({ stripUnknown: true })
        }
    })
    async tweet(request: Request): Promise<TweetTrap> {
        let tweetTrapData = request.payload as TweetTrap
        const user = request.auth.credentials as User

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
        } catch (e) {
            console.error(e)
        }

        let tweetTrap = await TweetTrap.create(tweetTrapData)
        await tweetTrap.save()

        return tweetTrap
    }

    @Get('/{id}')
    async get(request: Request): Promise<TweetTrap> {
        const id = request.params.id

        const tweetTrap = await TweetTrap.findOne({ where: { id } })

        if (!tweetTrap) {
            throw Boom.notFound('Tweet not found')
        }

        return tweetTrap
    }

    @Get()
    async list(request: Request): Promise<TweetTrap[]> {
        const user = request.auth.credentials as User

        return TweetTrap.find({
            relations: [ 'createdBy' ],
            where: { createdBy: user },
            take: 10,
            order: { id: 'DESC' }
        })
    }

    @Get('/{id}/replies')
    async getReplies(request: Request) {
        const id = request.params.id
        const user = request.auth.credentials as User

        const client = new Twitter({
            consumer_key: config.twitterConsumerApiKey,
            consumer_secret: config.twitterConsumerApiSecretKey,
            access_token_key: user.accessToken,
            access_token_secret: user.accessTokenSecret
        })

        try {
            // check if tweet still exists
            await client.get('statuses/show', {
                id
            })
        } catch (e) {
            if (e.errors[0].code === 144) {
                // delete the tweet from database
                const tweetTrap = await TweetTrap.findOne({ where: { id } })
                if (tweetTrap) {
                    await tweetTrap.remove()
                }
                throw Boom.notFound('Tweet not found')
            } else {
                logger('error', 'api', 'TweetTrapController.getReplies', e, id, user)
            }
        }

        let statuses = await client.get('statuses/mentions_timeline', {
            // q: 'to:' + user.screenName,
            since_id: id,
            count: 800
        })

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

        const logger = prepareLogger('info', 'socket', 'subscribeTweetTrapReplies', id, user)

        logger('socket connected')

        if (!user) {
            logger('not authenticated')
            return null
        }

        const client = new Twitter({
            consumer_key: config.twitterConsumerApiKey,
            consumer_secret: config.twitterConsumerApiSecretKey,
            access_token_key: user.accessToken,
            access_token_secret: user.accessTokenSecret
        })

        let wait = 30
        let stream: any
        let timer: any

        function handleExitStream() {
            clearTimeout(timer)
            socket.emit('tweetTrapReplyAutoSync', false)
            if (stream && typeof stream.destroy === 'function') {
                logger('stream exit')
                process.nextTick(() => stream.destroy())
            }
            socket.off('unsubscribeTweetTrapReplies', handleExitStream)
            socket.off('disconnect', handleExitStream)
        }

        function subscribeStream() {
            stream = client.stream('statuses/filter', {
                  track: '@' + user.screenName,
              })
              .on('start', (_response: any) => {
                  wait = 30
                  socket.emit('tweetTrapReplyAutoSync', true)
                  logger('stream started')
              })
              .on('data', (t: any) => {
                  if (t.in_reply_to_status_id_str === id) {
                      logger('new reply received')
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
                      logger(tweet)
                      socket.emit('newTweetTrapReply', tweet)
                  }
              })
              .on('ping', () => logger('stream ping'))
              .on('error', (error: any) => {
                  logger('not able to stream. trying again in ' + wait + ' seconds')
                  logger({
                      source: error.source,
                      status: error.status,
                      statusText: error.statusText
                  })
                  socket.emit('tweetTrapReplyAutoSync', false)
                  if (wait > 2147483647 / 1000) {
                      handleExitStream()
                  } else {
                      timer = setTimeout(subscribeStream, wait * 1000)
                      wait = wait + wait
                  }
              })
              .on('end', (_response: any) => logger('stream end'))

            socket.on('unsubscribeTweetTrapReplies', handleExitStream)
            socket.on('disconnect', handleExitStream)
        }

        subscribeStream()
    }

}