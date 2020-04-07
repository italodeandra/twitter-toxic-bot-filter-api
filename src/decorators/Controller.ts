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
        routeOptions.validate = options?.validate

        if (options.auth) {
            routeOptions.auth = 'twitter-basic'
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

export function Get(path?: string): any
export function Get(options?: Options): any
export function Get(x: any) {
    if (typeof x === 'string') {
        return Method('GET', x)
    } else {
        return Method('GET', undefined, x)
    }
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