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

let objects: Object[] = []
let players: Map<string, Player> = new Map()
let gameMapBounds: number[] = GameMap.settings.size;

function spawnObjects(): void {
    if(objects.length >= (gameMapBounds[0] + gameMapBounds[1])/20 * players.size){
        return
    }
    
    let randomNum: number = Math.round(Math.random())

    let randomRadius = randomNum ? 
        GameMap.settings.foodRadiusRange[0] + Math.random()*(GameMap.settings.foodRadiusRange[1] - GameMap.settings.foodRadiusRange[0]) : 
        GameMap.settings.wallsRadiusRange[0] + Math.random()*(GameMap.settings.wallsRadiusRange[1] - GameMap.settings.wallsRadiusRange[0])

    let randomColor: number[] = randomNum ? 
        [
            GameMap.settings.foodColorRange[0][0] + Math.random()*(GameMap.settings.foodColorRange[0][1] - GameMap.settings.foodColorRange[0][0]),
            GameMap.settings.foodColorRange[1][0] + Math.random()*(GameMap.settings.foodColorRange[1][1] - GameMap.settings.foodColorRange[1][0]),
            GameMap.settings.foodColorRange[2][0] + Math.random()*(GameMap.settings.foodColorRange[2][1] - GameMap.settings.foodColorRange[2][0])
        ] : 
        [
            GameMap.settings.wallsColorRange[0][0] + Math.random()*(GameMap.settings.wallsColorRange[0][1] - GameMap.settings.wallsColorRange[0][0]),
            GameMap.settings.wallsColorRange[1][0] + Math.random()*(GameMap.settings.wallsColorRange[1][1] - GameMap.settings.wallsColorRange[1][0]),
            GameMap.settings.wallsColorRange[2][0] + Math.random()*(GameMap.settings.wallsColorRange[2][1] - GameMap.settings.wallsColorRange[2][0])
        ]

    let randomX = -GameMap.settings.size[0]/2 + randomRadius + Math.random()*(GameMap.settings.size[0] - 2*randomRadius)
    let randomY = -GameMap.settings.size[1]/2 + randomRadius + Math.random()*(GameMap.settings.size[1] - 2*randomRadius)
    
    let gameObject: Object = {
        'randomNum' : randomNum,
        'x': randomX,
        'y': randomY,
        'radius': randomRadius,
        'color': randomColor
    }
    objects.push(gameObject)
    console.log(`Server: spawned object at ${randomX}:${randomY}`)
    io.of('/client').emit('spawnObject', gameObject)

    setTimeout(spawnObjects, 1000)
}

io.of('/client').on("connection", (socket: Socket) => {
    console.log(`user ${socket.id} connected`)
    spawnObjects()
    
    for(const entry of players) {
        socket.emit('getPlayer', {
            'id': entry[0],
            'player': entry[1]
        })
    }

    for(const object of objects){
        socket.emit('spawnObject', object)
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
