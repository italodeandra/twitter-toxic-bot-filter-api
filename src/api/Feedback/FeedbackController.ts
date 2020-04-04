import { Controller, ControllerType, Post } from '../../decorators/Controller'
import { Request } from '@hapi/hapi'
import Joi from '@hapi/joi'
import { Feedback } from './FeedbackEntity'

@Controller('/feedback')
export default class HealthCheckController extends ControllerType {

    @Post({
        validate: {
            payload: Joi.object({
                rate: Joi.number().min(0).max(5).required(),
                message: Joi.string().max(1500).required()
            }).options({ stripUnknown: true })
        }
    })
    async save(request: Request) {
        const payload = request.payload as Feedback

        const feedback = await Feedback.create(payload)
        await feedback.save()

        return { message: 'Thank you for your feedback' }
    }

}