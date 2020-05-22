import * as express from 'express'
import * as config from './config'
import * as passport from 'passport'
import * as sio from 'socket.io'
import * as uniqid from 'uniqid'
import { Socket } from 'socket.io'
import * as session from 'express-session'
import * as GameMap from '../api/GameMapConfig'

import apiRouter from './routes/api'
import assetsRouter from './routes/assets'
import clientRouter from './routes/client'
import loginRouter from './routes/login'
import registerRouter from './routes/register'
import mainRouter from './routes/main'
import logoutRouter from './routes/logout'
import statsRouter from './routes/stats'
import rankingsRouter from './routes/rankings'

import initializePassport from './passport-config'

import * as mysql from 'mysql'
const app = express(), conf = config.default

let flash = require('express-flash')
let http = require("http").Server(app)

let objTime: number = Date.now();
let io: SocketIO.Server = sio.listen(http)
let objects: Map<string, any> = new Map(), players: Map<string, any> = new Map()

let connection: mysql.Connection = mysql.createConnection({
    host: config.default.server_ip,
    user: config.default.database.user,
    password: config.default.database.password,
    database: config.default.database.name
});

connection.query(`USE ${connection.config.database}`);

app.set('view-engine', 'ejs')
    .set('port', process.env.PORT || conf.server_port)

app.use(express.urlencoded({ extended: false }))
    .use(flash())
    .use(session({
        secret: uniqid(),
        resave: false,
        saveUninitialized: false
    }))
    .use(passport.initialize())
    .use(passport.session())
    .use('/', mainRouter)
    .use('/api', apiRouter)
    .use('/assets', assetsRouter)
    .use('/client', clientRouter)
    .use('/login', loginRouter)
    .use('/register', registerRouter)
    .use('/logout', logoutRouter)
    .use('/stats', statsRouter)
    .use('/rankings', rankingsRouter)

initializePassport(passport)

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
spawnObjects()

function setObjTime(){
    
    let secondsPassed: number = Math.floor((Date.now() - objTime)/1000);
    io.of('/client').emit('secondsPassed', secondsPassed);

    if(secondsPassed >= GameMap.settings.maxSecondsForGame){
        objTime = Date.now();
    }

    setTimeout(setObjTime, 1000)
}
setObjTime()
io.of('/client').on("connection", (socket: Socket) => {

    for (const player of players) {
        socket.emit('spawnPlayer', player[1])
    }

    for (const object of objects) {
        socket.emit('spawnObject', object[1])
    }

    socket.on('updateRankings', (data: any) => {
        let multiplier: number = GameMap.settings.multiplierScoreForLoser;

        if(data.winner){
            multiplier = GameMap.settings.multiplierScoreForWinner;
        }

        connection.query('SELECT id FROM users WHERE username = ?', data.username , (err, rows) => {

            connection.query('UPDATE userStats SET score = score + ? WHERE userId = ?', 
            [Math.floor(data.radius*multiplier), rows[0].id])
            connection.query('UPDATE userStats SET rank = rank + ? WHERE userId = ?', 
            [data.winner ? 1 : 0, rows[0].id])
        });
        
        console.log(`Server: Rankings updated for ${data.username}`)
    })
    socket.on('spawnPlayer', (data: any) => {
        if (players.has(socket.id) || !socket.connected) {
            return
        }

        data.id = socket.id
        players.set(socket.id, data)

        console.log(`Server: User ${data.username} spawned`)
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
    socket.on('createExplosion', (data: any) => {

        socket.broadcast.emit('createExplosion', data)
    })
    socket.on('disconnect', () => {
        if (players.has(socket.id)) {
            console.log(`Server: User ${players.get(socket.id).username} disconnected`)
            players.delete(socket.id)
        }

        socket.broadcast.emit('disconnectPlayer', socket.id)
    })
})

http.listen(conf.server_port, "0.0.0.0", () => { 
    console.log(`server started on ${conf.server_ip}:${conf.server_port}`)
})
