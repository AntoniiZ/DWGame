import * as express from 'express'
import * as config from './config'
import { Socket } from 'socket.io'

import apiRouter from './routes/api'
import assetsRouter from './routes/assets'
import clientRouter from './routes/client'

import { Arc } from '../api/Arc'
import { Food } from '../api/Food'
import { Player } from '../api/Player'
import { BouncyWall } from '../api/BouncyWall'
import * as GameMap from '../api/GameMapConfig'

import { game } from '../client/game'

const app = express()
const conf = config.default
app.set("port", process.env.PORT || conf.server_port)

let http = require("http").Server(app)
let io = require("socket.io")(http)

app.use('/api', apiRouter)
app.use('/assets', assetsRouter)
app.use('/client', clientRouter)

let players: Map<string, Player> = new Map()
let gameMapBounds: number[] = GameMap.settings.size 

io.of('/client').on("connection", (socket: Socket) => {
    console.log(`user ${socket.id} connected`)
    
    for(const entry of players) {
        socket.emit('getPlayer', {
            'id': entry[0],
            'player': entry[1]
        })
    }

    socket.on('spawnPlayer', (data: any) => {
        
        players.set(socket.id, new Player(
            data.scene, 
            data.graphics, 
            data.shape, 
            data.speed,
            socket.id,
            data.velocity,
        ))
        data.id = socket.id
        
        socket.broadcast.emit('spawnPlayer', data)
        
    })
    socket.on('updatePlayer', (data: any) => {

        if(!players.has(socket.id) || socket.id == undefined){
            return
        }

        let shape: Phaser.GameObjects.Arc = players.get(socket.id).getShape()
        shape.x = data.x; shape.y = data.y; shape.radius = data.radius; shape.fillColor = data.color
        data.id = socket.id

        socket.broadcast.emit('updatePlayer', data)
    })

    socket.on('disconnect', () => {
        console.log(`user ${socket.id} disconnected`)
        players.delete(socket.id)

        socket.broadcast.emit('disconnectPlayer', socket.id)
    })
})

http.listen(conf.server_port, () => {})
