import socket from '../socket'
import { Socket } from 'socket.io'
import { User } from '../api/User/UserEntity'

export function SocketOn(event: string, auth: boolean = false) {
    return function (target: any, propertyKey: string) {
        socket.events.push({
            name: event,
            handler(socket: Socket, ...props) {
                if (auth) {
                    const user: User = (socket as any).user
                    if (!user) {
                        return null
                    }
                }
                target[propertyKey](socket, props)
            },
            auth
        })
    }
}