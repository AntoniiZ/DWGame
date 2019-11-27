import * as express from 'express'
import * as path from 'path'
import * as config from './config'
import { Socket } from 'socket.io'

const app = express()
const conf = config.default
app.set("port", process.env.PORT || conf.server_port)

let http = require("http").Server(app)
let io = require("socket.io")(http)

app.use(express.static(path.join( __dirname, "../client")))

io.on("connection", function(socket: Socket) {
  console.log("Client connected!")
  
})

http.listen(conf.server_port, function() {
  console.log(`listening on port ${conf.server_port}`)
})
