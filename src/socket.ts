import SocketIO from 'socket.io'
import { Server } from '@hapi/hapi'
import UserService from './api/User/UserService'
import { User } from './api/User/UserEntity'

const socketToExport: any = {
    events: [],
    async start(server: Server) {
        const io = SocketIO(server.listener)

        io.on('connection', function (socket) {
            socket.on('auth', async (userData: User) => {
                if (userData) {
                    (socket as any).user = await new UserService().getInfoFromTwitterAndSave(userData.accessToken, userData.accessTokenSecret)
                    socket.emit('authenticated', true)
                } else {
                    (socket as any).user = null
                    socket.emit('authenticated', false)
                }
            })

            for (let event of socketToExport.events) {
                socket.on(event.name, event.handler.bind(null, socket))
            }
        })
    },
}

export default socketToExport