import { Controller, Post } from '../../decorators/Controller'
import { Request } from '@hapi/hapi'
import Joi from '@hapi/joi'
import { Feedback } from './FeedbackEntity'
import { User } from '../User/UserEntity'

@Controller('/feedback', true)
export default class FeedbackController {

    @Post({
        validate: {
            payload: Joi.object({
                rate: Joi.number().min(0).max(5).required(),
                message: Joi.string().max(1500)
            }).options({ stripUnknown: true })
        }
    })
    async save(request: Request) {
        let payload = request.payload as Feedback
        let user = request.auth.credentials as User

        const feedback = await Feedback.create(payload)
        feedback.createdBy = user!
        await feedback.save()

        return { message: 'Thank you for your feedback' }
    }

}