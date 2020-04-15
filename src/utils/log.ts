import { User } from '../api/User/UserEntity'
import config from '../config'

type Log = {
    type?: 'info'
    message: string
} | {
    type?: 'info' | 'error'
    context: 'server'
    message?: string
    error?: any
    [key: string]: any
} | {
    type?: 'info' | 'error'
    context: 'api'
    api: string
    method: string
    params?: any
    query?: any
    payload?: any
    user?: User,
    message?: string
    error?: any
    [key: string]: any
} | {
    type?: 'info' | 'error'
    context: 'socket'
    api: string
    method: string
    event: string
    params: { [key: string]: any }
    user?: User,
    message?: string
    error?: any
    [key: string]: any
} | {
    type?: 'info' | 'error'
    context: 'request',
    path: string
    params: any,
    query: any,
    payload: any,
    user?: User,
    headers: { [key: string]: any },
    response: { [key: string]: any },
    error?: any
}

export function prepareLog(preparedData: Log) {
    preparedData.type = preparedData.type || 'info'
    let data = { ...preparedData }
    data.type = data.type || 'info'

    const methods = {
        update(updatedData: { [key: string]: any }) {
            data = { ...preparedData, ...updatedData }
            return methods
        },
        save() {
            log(data.type!, data)
        }
    }

    return methods
}

export function logInfo(data: Log): void {
    log('info', data)
}

export function logError(data: Log): void {
    const error = new Error(JSON.stringify(data));
    (data as any).trace = error.stack
    log('error', data)
}

export function log(type: 'info' | 'error', data: Log): void {
    data.type = type
    let consoleType: 'log' | 'info' | 'error' = type
    if (type === 'info') consoleType = 'log'
    if (config.env === 'development') {
        console[consoleType](data)
    } else {
        console[consoleType](JSON.stringify(data), null, 2)
    }
}