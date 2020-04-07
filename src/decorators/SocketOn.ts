import socket from '../socket'

export function SocketOn(event: string, auth: boolean = false) {
    return function (target: any, propertyKey: string) {
        socket.events.push({
            name: event, handler: target[propertyKey], auth
        })
    }
}