import * as express from 'express'
import * as config from './config'
import { Socket } from 'socket.io'

import api from './routes/api'
import client from './routes/client'

const app = express()
const conf = config.default
app.set("port", process.env.PORT || conf.server_port)

let http = require("http").Server(app)
let io = require("socket.io")(http)

app.use('/api', api)
app.use('/client', client)

io.on("connection", (socket: Socket) => {})

http.listen(conf.server_port, () => {})
