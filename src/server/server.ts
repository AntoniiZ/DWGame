import * as express from 'express'
import * as config from './config'
import { Socket } from 'socket.io'

import apiRouter from './routes/api'
import assetsRouter from './routes/assets'
import clientRouter from './routes/client'

const app = express()
const conf = config.default
app.set("port", process.env.PORT || conf.server_port)

let http = require("http").Server(app)
let io = require("socket.io")(http)

app.use('/api', apiRouter)
app.use('/assets', assetsRouter)
app.use('/client', clientRouter)

io.of('/client').on("connection", (socket: Socket) => {
    console.log(`user ${socket.id} connected`)

    socket.on('disconnect', () => {
        console.log(`user ${socket.id} disconnected`)
    })
})

http.listen(conf.server_port, () => {})
