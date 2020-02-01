import * as express from 'express'
import * as config from './config'
import { Socket } from 'socket.io'

import apiRouter from './routes/api'
import assetsRouter from './routes/assets'
import clientRouter from './routes/client'

import { Player } from '../api/Player'
import * as GameMap from '../api/GameMapConfig'

const app = express()
const conf = config.default
app.set("port", process.env.PORT || conf.server_port)

let http = require("http").Server(app)
let io = require("socket.io")(http)

app.use('/api', apiRouter)
app.use('/assets', assetsRouter)
app.use('/client', clientRouter)

let spawnObjectsTimeout: NodeJS.Timeout
let objects: any = [], explosions: any = []
let players: Map<string, any> = new Map()
let gameMapBounds: number[] = GameMap.settings.size;

function spawnObjects(): void {
    /// move magic number divisor 20 in game map config
    if (objects.length >= 10 * (players.size)) {
        clearTimeout(spawnObjectsTimeout)
        return
    }
    let isSpawned: boolean = false
    while (!isSpawned) {
        let collide: boolean = false
        let randomNum: number = Math.round(Math.random())

        let randomRadius = randomNum ?
            GameMap.settings.foodRadiusRange[0] + Math.random() * (GameMap.settings.foodRadiusRange[1] - GameMap.settings.foodRadiusRange[0]) :
            GameMap.settings.wallsRadiusRange[0] + Math.random() * (GameMap.settings.wallsRadiusRange[1] - GameMap.settings.wallsRadiusRange[0])

        let randomColor: number[] = randomNum ?
            [
                GameMap.settings.foodColorRange[0][0] + Math.random() * (GameMap.settings.foodColorRange[0][1] - GameMap.settings.foodColorRange[0][0]),
                GameMap.settings.foodColorRange[1][0] + Math.random() * (GameMap.settings.foodColorRange[1][1] - GameMap.settings.foodColorRange[1][0]),
                GameMap.settings.foodColorRange[2][0] + Math.random() * (GameMap.settings.foodColorRange[2][1] - GameMap.settings.foodColorRange[2][0])
            ] :
            [
                GameMap.settings.wallsColorRange[0][0] + Math.random() * (GameMap.settings.wallsColorRange[0][1] - GameMap.settings.wallsColorRange[0][0]),
                GameMap.settings.wallsColorRange[1][0] + Math.random() * (GameMap.settings.wallsColorRange[1][1] - GameMap.settings.wallsColorRange[1][0]),
                GameMap.settings.wallsColorRange[2][0] + Math.random() * (GameMap.settings.wallsColorRange[2][1] - GameMap.settings.wallsColorRange[2][0])
            ]

        let randomX = -GameMap.settings.size[0] / 2 + randomRadius +
            Math.random() * (GameMap.settings.size[0] - 2 * randomRadius)
        let randomY = -GameMap.settings.size[1] / 2 + randomRadius +
            Math.random() * (GameMap.settings.size[1] - 2 * randomRadius)

        let gameObject = {
            randomNum: randomNum,
            x: randomX,
            y: randomY,
            radius: randomRadius,
            initialRadius: randomRadius,
            color: randomColor,
            speed: 1 + Math.random(),
            radDelta: 1 / 6,
            vel: {
                x: -1 + Math.random() * 2,
                y: -1 + Math.random() * 2
            }
        }
        for (let i = 0; i < objects.length; i++) {
            if(objects[i] == null){
                continue
            }
            if (Math.sqrt(Math.abs(objects[i].x - gameObject.x) ** 2 + Math.abs(objects[i].y - gameObject.y) ** 2) <
                gameObject.radius + objects[i].radius) {
                collide = true
                break;
            }
        }
        if (!collide) {
            objects.push(gameObject)
            //console.log(`Server: spawned object at ${randomX}:${randomY}`)
            io.of('/client').emit('spawnObject', gameObject)

            isSpawned = true
            //updateObject(objects.length-1)
        }

    }
    spawnObjectsTimeout = setTimeout(spawnObjects, 100)
}

/*function updateObjects(): void {

    for (let i = objects.length - 1; i >= 0; i--) {
        if (objects[i].vel.x && objects[i].vel.y && !objects[i].randomNum) {

            objects[i].x += objects[i].speed * objects[i].vel.x
            objects[i].y += objects[i].speed * objects[i].vel.y

            if (objects[i].x <= -gameMapBounds[0] / 2 + objects[i].radius) {
                objects[i].x = -gameMapBounds[0] / 2 + objects[i].radius
                objects[i].vel.x = -objects[i].vel.x
            }
            else if (objects[i].x >= gameMapBounds[0] / 2 - objects[i].radius) {
                objects[i].x = gameMapBounds[0] / 2 - objects[i].radius
                objects[i].vel.x = -objects[i].vel.x
            }

            if (objects[i].y <= -gameMapBounds[1] / 2 + objects[i].radius) {
                objects[i].y = -gameMapBounds[1] / 2 + objects[i].radius
                objects[i].vel.y = -objects[i].vel.y
            }
            else if (objects[i].y >= gameMapBounds[1] / 2 - objects[i].radius) {
                objects[i].y = gameMapBounds[1] / 2 - objects[i].radius
                objects[i].vel.y = -objects[i].vel.y
            }

        }

        if (objects[i].radius >= objects[i].initialRadius * 1.25 ||
            objects[i].radius <= objects[i].initialRadius * 0.75) {

            // 50 100 150 (/2, *1.5) | 75 100 125
            objects[i].radDelta = -objects[i].radDelta;
        }

        objects[i].radius += objects[i].radDelta
        io.of('/client').emit('updateObject', {
            'index': i,
            'x': objects[i].x,
            'y': objects[i].y,
            'radius': objects[i].radius,
            'speed': objects[i].speed,
            'vel': {
                'x': objects[i].vel.x,
                'y': objects[i].vel.y
            }
        })
        for(let k = 0; k < objects.length; k++){
            if(i == k){
                continue
            }
            if (!(Math.sqrt(Math.abs(objects[i].x - objects[k].x) ** 2 + Math.abs(objects[i].y - objects[k].y) ** 2) <
                objects[k].radius + objects[i].radius)) {
                continue
            }
            
            if (!objects[i].randomNum && !objects[k].randomNum) {
                
                let indCmp: boolean = i < k
                objects.splice(i, 1)
                indCmp ? objects.splice(k-1, 1) : objects.splice(k, 1)

                io.of('/client').emit('destroyObject', {
                    'index': i--
                })
                io.of('/client').emit('destroyObject', {
                    'index': k
                })
                break
            }
        }

        for (const player of players) {
            if (!(Math.sqrt(Math.abs(objects[i].x - player[1].getShape().x) ** 2 + Math.abs(objects[i].y - player[1].getShape().y) ** 2) <
                player[1].getShape().radius + objects[i].radius)) {
                continue
            }
            if (!objects[i].randomNum) {
                objects[i].vel.x = objects[i].vel.y = 0
                io.of('/client').emit('updateObject', {
                    'index': i,
                    'x': objects[i].x,
                    'y': objects[i].y,
                    'radius': objects[i].radius,
                    'speed': objects[i].speed,
                    'vel': {
                        'x': objects[i].vel.x,
                        'y': objects[i].vel.y
                    }
                })
                continue
            }
            objects.splice(i, 1)
            io.of('/client').emit('destroyObject', {
                'index': i--
            })
            break
        }
    }
    setTimeout(updateObjects, 1000 / 60)
}
updateObjects()
*/
/*
let timeout: NodeJS.Timeout[] = []
function updateObject(i: number): void {
    if(objects[i] == null){
        return
    }

    if (objects[i].vel.x && objects[i].vel.y && !objects[i].randomNum) {

        objects[i].x += objects[i].speed * objects[i].vel.x
        objects[i].y += objects[i].speed * objects[i].vel.y

        if (objects[i].x <= -gameMapBounds[0] / 2 + objects[i].radius) {
            objects[i].x = -gameMapBounds[0] / 2 + objects[i].radius
            objects[i].vel.x = -objects[i].vel.x
        }
        else if (objects[i].x >= gameMapBounds[0] / 2 - objects[i].radius) {
            objects[i].x = gameMapBounds[0] / 2 - objects[i].radius
            objects[i].vel.x = -objects[i].vel.x
        }

        if (objects[i].y <= -gameMapBounds[1] / 2 + objects[i].radius) {
            objects[i].y = -gameMapBounds[1] / 2 + objects[i].radius
            objects[i].vel.y = -objects[i].vel.y
        }
        else if (objects[i].y >= gameMapBounds[1] / 2 - objects[i].radius) {
            objects[i].y = gameMapBounds[1] / 2 - objects[i].radius
            objects[i].vel.y = -objects[i].vel.y
        }

    }

    if (objects[i].radius >= objects[i].initialRadius * 1.25 ||
        objects[i].radius <= objects[i].initialRadius * 0.75) {

        // 50 100 150 (/2, *1.5) | 75 100 125
        objects[i].radDelta = -objects[i].radDelta;
    }

    objects[i].radius += objects[i].radDelta
    io.of('/client').emit('updateObject', {
        'index': i,
        'x': objects[i].x,
        'y': objects[i].y,
        'radius': objects[i].radius,
        'speed': objects[i].speed,
        'vel': {
            'x': objects[i].vel.x,
            'y': objects[i].vel.y
        }
    })

    for (let k = 0; k < objects.length; k++) {
        if (i == k || objects[k] == null) {
            continue
        }
        if (!(Math.sqrt(Math.abs(objects[i].x - objects[k].x) ** 2 + Math.abs(objects[i].y - objects[k].y) ** 2) <
            objects[k].radius + objects[i].radius)) {
            continue
        }

        if (!objects[i].randomNum && !objects[k].randomNum) {

            clearTimeout(timeout[i])
            clearTimeout(timeout[k])
            objects[i] = objects[k] = null

            io.of('/client').emit('destroyObject', {
                'index': i
            })
            io.of('/client').emit('destroyObject', {
                'index': k
            })
            return
        }
    }

    for (const player of players) {
        if (!(Math.sqrt(Math.abs(objects[i].x - player[1].x) ** 2 + Math.abs(objects[i].y - player[1].y) ** 2) <
            player[1].radius + objects[i].radius)) {
            continue
        }
        if (!objects[i].randomNum) {
            objects[i].vel.x = objects[i].vel.y = 0
            io.of('/client').emit('updateObject', {
                'index': i,
                'x': objects[i].x,
                'y': objects[i].y,
                'radius': objects[i].radius,
                'speed': objects[i].speed,
                'vel': {
                    'x': objects[i].vel.x,
                    'y': objects[i].vel.y
                }
            })
            continue
        }
        objects[i] = null
        clearTimeout(timeout[i])
        io.of('/client').emit('destroyObject', {
            'index': i
        })
        return
    }

    timeout[i] = setTimeout(updateObject, 1000 / 60, i)
}
*/
io.of('/client').on("connection", (socket: Socket) => {
    console.log(`Server: User ${socket.id} connected`)

    for (const entry of players) {
        socket.emit('getPlayer', {
            'id': entry[0],
            'player': entry[1]
        })
    }

    for (const object of objects) {
        socket.emit('spawnObject', object)
    }

    socket.on('spawnPlayer', (data: any) => {

        players.set(socket.id, {
            'x': data.x,
            'y': data.y,
            'radius': data.radius,
            'color': data.color,
            'speed': data.speed,
            'vel': {
                'x': data.vel.x,
                'y': data.vel.y
            }
        })
        data.id = socket.id

        spawnObjects()
        socket.broadcast.emit('spawnPlayer', data)

    })

    socket.on('updateObject', (data: any) => {

        if (!players.has(socket.id) || socket.id == undefined) {
            return
        }
        if(objects[data.index] == null){
            return
        }
        Object.assign(objects[data.index], data)

        socket.broadcast.emit('updateObject', data)

    })
    socket.on('destroyObject', (data: any) => {
        if (!players.has(socket.id) || socket.id == undefined) {
            return
        }
        objects[data.index] = null
        //spawnObjects()

        socket.broadcast.emit('destroyObject', data)

    })
    socket.on('updatePlayer', (data: any) => {

        if (!players.has(socket.id) || socket.id == undefined) {
            return
        }

        data.id = socket.id

        let player: any = players.get(socket.id)
        Object.assign(player, data)

        socket.broadcast.emit('updatePlayer', data)
    })

    socket.on('disconnect', () => {
        if (!players.has(socket.id) || socket.id == undefined) {
            return
        }
        console.log(`Server: User ${socket.id} disconnected`)
        players.delete(socket.id)
        // spawnObjects()

        socket.broadcast.emit('disconnectPlayer', socket.id)
    })
})

http.listen(conf.server_port, () => { })
