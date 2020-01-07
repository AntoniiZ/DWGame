import * as express from 'express'
import * as config from './config'
import { Socket } from 'socket.io'

import apiRouter from './routes/api'
import assetsRouter from './routes/assets'
import clientRouter from './routes/client'

import { Arc } from '../api/Arc'
import * as GameMap from '../api/GameMapConfig'
import { Player } from '../api/Player'

const app = express()
const conf = config.default
app.set("port", process.env.PORT || conf.server_port)

let http = require("http").Server(app)
let io = require("socket.io")(http)

app.use('/api', apiRouter)
app.use('/assets', assetsRouter)
app.use('/client', clientRouter)

let players: Map<string, Player> = new Map()

io.of('/client').on("connection", (socket: Socket) => {
    console.log(`user ${socket.id} connected`)

    socket.emit('getPlayers', Array.from(players))

    socket.on('spawnPlayer', (data: any) => {

        players.set(socket.id, new Player(
            data.scene, 
            data.graphics, 
            data.shape, 
            data.speed,
            socket.id,
            data.velocity,
        ))
    })

    socket.on('updatePlayer', (data: any) => {
        if(data.id == undefined){
            return
        }

        let shape: Phaser.GameObjects.Arc = players.get(data.id).getShape()
        shape.x = data.x
        shape.y = data.y
        shape.radius = data.radius
        console.log(`new coords |${players.get(data.id).getSocketId()}|${shape.x}|${shape.y}|${shape.radius}`)
    })

    socket.on('disconnect', () => {
        console.log(`user ${socket.id} disconnected`)
        players.delete(socket.id)
    })
})

http.listen(conf.server_port, () => {})
