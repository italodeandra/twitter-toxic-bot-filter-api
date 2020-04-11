import { Controller, Post } from '../../decorators/Controller'
import { Request } from '@hapi/hapi'
import Joi from '@hapi/joi'
import { Feedback } from './FeedbackEntity'
import Autowired from '../../decorators/Autowired'
import UserService from '../User/UserService'

@Controller('/feedback', true)
export default class FeedbackController {

    @Autowired
    userService!: UserService

    @Post({
        validate: {
            payload: Joi.object({
                rate: Joi.number().min(0).max(5).required(),
                message: Joi.string().max(1500).optional().allow('')
            }).options({ stripUnknown: true })
        }
    })
    async save(request: Request) {
        const payload = request.payload as Feedback
        const user = await this.userService.getByCredentials(request.auth.credentials)

        const feedback = await Feedback.create(payload)
        feedback.createdBy = user!
        await feedback.save()

        return { message: 'Thank you for your feedback' }
    }

}