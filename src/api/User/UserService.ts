import Twitter from 'twitter-lite'
import config from '../../config/config'
import Boom from '@hapi/boom'
import { User } from './UserEntity'

export default class UserService {

    async getInfoFromTwitterAndSave(accessToken: string, accessTokenSecret: string): Promise<User> {
        const client = new Twitter({
            consumer_key: config.twitterConsumerApiKey,
            consumer_secret: config.twitterConsumerApiSecretKey,
            access_token_key: accessToken,
            access_token_secret: accessTokenSecret
        })

        let name, profileImageUrl, id, screenName
        try {
            let response = await client.get('account/verify_credentials')
            id = response.id_str
            screenName = response.screen_name
            name = response.name
            profileImageUrl = response.profile_image_url_https.replace('normal.', '200x200.')
        } catch (e) {
            console.error(e)
            throw Boom.unauthorized('Twitter token expired', 'Bearer')
        }

        let user = await User.create({
            id,
            screenName,
            accessToken,
            accessTokenSecret,
            name,
            profileImageUrl
        })
        await user.save()

        return user
    }

}