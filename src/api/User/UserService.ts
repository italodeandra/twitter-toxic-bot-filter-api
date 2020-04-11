import Twitter from 'twitter-lite'
import config from '../../config'
import { User } from './UserEntity'
import { AuthCredentials } from '@hapi/hapi'
import handleTwitterError from '../../utils/handleTwitterError'

export default class UserService {

    async getById(id: string): Promise<User | undefined> {
        return User.findOne({ where: { id } })
    }

    async getByCredentials(credentials: AuthCredentials): Promise<User> {
        return (await this.getById((credentials as any).id))!
    }

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
        } catch (error) {
            throw handleTwitterError(error)
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