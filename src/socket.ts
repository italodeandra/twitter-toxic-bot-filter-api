import SocketIO from 'socket.io'
import { Server } from '@hapi/hapi'
import { User } from './api/User/UserEntity'
import jwt from 'jsonwebtoken'
import config from './config'

const socketToExport: any = {
    events: [],
    async start(server: Server) {
        const io = SocketIO(server.listener)

        io.on('connection', function (socket) {
            socket.on('auth', async (userData: User) => {
                if (userData) {
                    try {
                        const decoded: any = jwt.verify((userData as any).token, config.authSecret);
                        (socket as any).user = await User.findOne({ where: { id: decoded.id } })
                        // (socket as any).user = await new UserService().getInfoFromTwitterAndSave(userData.accessToken, userData.accessTokenSecret)
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