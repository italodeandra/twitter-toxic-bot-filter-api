import SocketIO, { Socket } from 'socket.io'
import { Server } from '@hapi/hapi'
import { User } from './api/User/UserEntity'
import jwt from 'jsonwebtoken'
import config from './config'

const socketToExport = {
    events: [] as { name: string, handler: (socket: Socket) => void, auth: boolean }[],
    async start(server: Server) {
        const io = SocketIO(server.listener)

        io.on('connection', function (socket) {
            socket.on('auth', async (userData: User) => {
                if (userData) {
                    try {
                        const decoded: any = jwt.verify((userData as any).token, config.authSecret);
                        (socket as any).user = await User.findOne({ where: { id: decoded.id } })
                    } catch (error) {
                        (socket as any).user = null
                    }
                } else {
                    (socket as any).user = null
                }
                socket.emit('authenticated', !(socket as any).user)
            })

            for (let event of socketToExport.events) {
                socket.on(event.name, event.handler.bind(null, socket))
            }
        })
    },
}

export default socketToExport