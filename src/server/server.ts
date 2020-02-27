import * as express from 'express'
import * as config from './config'
import { Socket } from 'socket.io'

import apiRouter from './routes/api'
import assetsRouter from './routes/assets'
import clientRouter from './routes/client'
import loginRouter from './routes/login'
import registerRouter from './routes/register'
import mainRouter from './routes/main'
import initializePassport from './passport-config'

import * as GameMap from '../api/GameMapConfig'

const app = express()
const conf = config.default
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

export let users: any[] = []

initializePassport(
    passport,
    (username: any) => users.find(user => user.username === username),
    (id: any) => users.find(user => user.id === id)
)

let http = require("http").Server(app)
let io = require("socket.io")(http)
let uniqid = require('uniqid');

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.use(flash())
app.use(session({
    secret: uniqid(),
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

app.set('port', process.env.PORT || conf.server_port)

app.use('/', mainRouter)
app.use('/api', apiRouter)
app.use('/assets', assetsRouter)
app.use('/client', clientRouter)
app.use('/login', loginRouter)
app.use('/register', registerRouter)

let objects: Map<string, any> = new Map()
let players: Map<string, any> = new Map()

function spawnObjects(): void {

    if (objects.size >= GameMap.settings.amountOfObjectsPerPlayer * (players.size + 1)) {
        setTimeout(spawnObjects, 100)
        return
    }
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
        id: uniqid(),
        randomNum: randomNum,
        x: randomX, y: randomY,
        radius: randomRadius,
        initialRadius: randomRadius,
        color: randomColor,
        speed: 0, velx: 0, vely: 0
    }
    for (let [key, player] of players) {
        if (Math.sqrt(Math.abs(player.x - gameObject.x) ** 2 + Math.abs(player.y - gameObject.y) ** 2) <
            gameObject.radius + player.radius) {
            collide = true
            break;
        }
    }
    for (let [key, object] of objects) {
        if (Math.sqrt(Math.abs(object.x - gameObject.x) ** 2 + Math.abs(object.y - gameObject.y) ** 2) <
            gameObject.radius + object.radius) {
            collide = true
            break;
        }
    }
    
    if (!collide) {
        objects.set(gameObject.id, gameObject)

        io.of('/client').emit('spawnObject', gameObject)
    }

    setTimeout(spawnObjects, 100)
}

io.of('/client').on("connection", (socket: Socket) => {
    console.log(`Server: User ${socket.id} connected`)

    for (const player of players) {
        socket.emit('spawnPlayer', player[1])
    }

    for (const object of objects) {
        socket.emit('spawnObject', object[1])
    }

    socket.on('spawnPlayer', (data: any) => {
        if (players.has(socket.id) || !socket.connected) {
            return
        }

        data.id = socket.id
        players.set(socket.id, data)

        socket.broadcast.emit('spawnPlayer', data)
    })

    socket.on('updateObject', (data: any) => {

        if (!objects.has(data.id)) {
            return
        }
        Object.assign(objects.get(data.id), data)

        socket.broadcast.emit('updateObject', data)

    })
    socket.on('destroyObject', (data: any) => {

        if (!objects.has(data.id) || !socket.connected) {
            return
        }
        objects.delete(data.id)

        socket.broadcast.emit('destroyObject', data)

    })
    socket.on('updatePlayer', (data: any) => {

        if (!players.has(socket.id) || !socket.connected) {
            return
        }

        data.id = socket.id

        let player: any = players.get(socket.id)
        Object.assign(player, data)

        socket.broadcast.emit('updatePlayer', data)
    })

    socket.on('disconnect', () => {
        console.log(`Server: User ${socket.id} disconnected`)
        if (players.has(socket.id)) {
            players.delete(socket.id)
        }

        socket.broadcast.emit('disconnectPlayer', socket.id)
    })
})

http.listen(conf.server_port, () => { 
    console.log(`server started on port ${conf.server_port}`)
    spawnObjects()
})
