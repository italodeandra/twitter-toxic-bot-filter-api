import { RouteOptions, RouteOptionsValidate } from '@hapi/hapi'
import { routes } from '../api/api'

export function Controller(path: string, auth?: boolean) {
    return function (_constructor: any) {
        for (let route of routes) {
            if (!route.controlled) {
                route.controlled = true
                if (path) {
                    route.path = path + (route.path || '')
                }
                if (auth) {
                    route.options = {
                        ...route.options,
                        auth: 'twitter-basic',
                    } as RouteOptions
                }
            }
        }
    }
}


interface Options {
    path?: string
    validate?: RouteOptionsValidate
    auth?: boolean
}

function Method(method: string, path?: string, options?: Options) {
    let routeOptions: RouteOptions = {}

    if (options) {
        path = options.path

        if (options.auth) {
            routeOptions = {
                validate: options?.validate,
                auth: 'twitter-basic',
            } as RouteOptions
        }
    }

    return function (target: any, propertyKey: string) {
        routes.push({
            method,
            path,
            handler: target[propertyKey].bind(target),
            options: routeOptions,
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