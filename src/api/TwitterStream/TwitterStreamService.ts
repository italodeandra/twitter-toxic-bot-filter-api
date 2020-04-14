import { User } from '../User/UserEntity'
import Twitter from 'twitter-lite'
import config from '../../config'
import { find, remove } from 'lodash'

class Stream {
    twitterStream: any
    user: User
    path: string
    data: any
    _parent: TwitterStreamService
    timer: NodeJS.Timeout

    constructor(user: User, path: string, data: any, caller: TwitterStreamService) {
        const client = new Twitter({
            consumer_key: config.twitterConsumerApiKey,
            consumer_secret: config.twitterConsumerApiSecretKey,
            access_token_key: user.accessToken,
            access_token_secret: user.accessTokenSecret
        })

        this.timer = setInterval(() => {
            if (this.twitterStream.listenerCount('data') === 0) {
                this.destroy()
            }
        }, 60 * 1000)
        this.user = user
        this.path = path
        this.data = data
        this._parent = caller
        this.twitterStream = client.stream(path, data)
          .on('end', () => {
              this.destroy()
          })
    }

    on(event: string, handler: Function): any {
        this.twitterStream.on(event, handler)
        return this
    }

    off(event: string, handler: Function): any {
        this.twitterStream.off(event, handler)
        return this
    }

    destroy() {
        clearInterval(this.timer)
        this._parent.remove(this)
    }
}

export default class TwitterStreamService {

    streams: Stream[] = []

    get(user: User, path: string, data: any): Stream | undefined {
        return find(this.streams, { user, path, data })
    }

    register(user: User, path: string, data: any): Stream {
        let stream = find(this.streams, { user, path, data })
        if (!stream) {
            stream = new Stream(user, path, data, this)
            this.streams.push(stream)
        }
        return stream
    }

    remove(stream: Stream): void {
        remove(this.streams, { user: stream.user, path: stream.path, data: stream.data })
    }

}