import { RouteOptionsValidate, ServerRoute } from '@hapi/hapi'

export class ControllerType extends Function {
    routes?: ServerRoute[]
}

export function Controller(path: string) {
    return function (constructor: ControllerType) {
        if (constructor.routes && path) {
            for (let route of constructor.routes) {
                route.path = path + (route.path || '')
            }
        }
    }
}


interface Options {
    path?: string
    validate?: RouteOptionsValidate
}

function Method(method: string, path?: string, options?: Options) {
    if (options) {
        path = options.path
        delete options.path
    }

    return function (target: any, propertyKey: string) {
        target.constructor.routes = target.constructor.routes || []
        target.constructor.routes.push({
            method,
            path,
            handler: target[propertyKey],
            options: options
        })
    }
}

export function Get(path?: string) {
    return Method('GET', path)
}

export function Post(path?: string): any
export function Post(options?: Options): any
export function Post(x: any) {
    if (typeof x === 'string') {
        return Method('POST', x)
    } else {
        return Method('POST', undefined, x)
    }
}