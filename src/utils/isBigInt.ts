import { CustomHelpers } from '@hapi/joi'

export default function isBigInt<V>(value: V, helpers: CustomHelpers) {
    if (+value > 9223372036854775807) {
        return helpers.error('any.invalid')
    }

    return value
}