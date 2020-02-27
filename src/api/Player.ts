import { Arc } from "./Arc";
import { Food } from "./Food";
import { BouncyWall } from "./BouncyWall";
import * as GameMap from "./GameMapConfig"
import * as config from "../server/config"
export class Player extends BouncyWall {

    private username: string
    private socket: SocketIOClient.Socket
    private players: Map<string, Player> = new Map()
    private objects: Map<string, Arc> = new Map()

    public constructor(socket: SocketIOClient.Socket, username: string, scene: Phaser.Scene, 
        graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc, speed?: number, 
        velocity?: Phaser.Geom.Point){
        
        super(scene, graphics, shape, speed, velocity)

        this.socket = socket
        this.username = username
    }

    public getUsername(){
        return this.username
    }

    public move() : void {
        super.move()
    }

    public getSocket() : SocketIOClient.Socket {
        return this.socket
    }

    public spawnPlayer(): SocketIOClient.Socket {
        let shape: Phaser.GameObjects.Arc = this.getShape()
        return this.socket.emit('spawnPlayer', {
            username: this.getUsername(),
            x: shape.x,
            y: shape.y,
            radius: shape.radius,
            color: shape.fillColor,
            speed: this.getSpeed(),
            vel: {
                x: this.getVelocity().x,
                y: this.getVelocity().y
            }
        })
    }

    public updatePlayer(): SocketIOClient.Socket {

        let shape: Phaser.GameObjects.Arc = this.getShape()
        return this.socket.emit('updatePlayer', {
            x: shape.x,
            y: shape.y,
            radius: shape.radius,
            color: shape.fillColor,
            speed: this.getSpeed(),
            vel: {
                x: this.getVelocity().x,
                y: this.getVelocity().y
            }
        })
    }
    public updateObject(id: string, object: Arc): SocketIOClient.Socket {

        let shape: Phaser.GameObjects.Arc = object.getShape()

        return this.socket.emit('updateObject', {
            id: id,
            x: shape.x,
            y: shape.y,
            radius: shape.radius,
            speed: object.getSpeed(),
            vel: {
                x: object.getVelocity().x,
                y: object.getVelocity().y
            }
        })
    }

    public destroyObject(id: string): SocketIOClient.Socket {
        
        return this.socket.emit('destroyObject', {id: id})
    }

    public getOtherPlayers(): Map<string, Player> {
        return this.players
    }

    public getObjects() : Map<string, Arc> {
        return this.objects
    }

    public disconnect() : SocketIOClient.Socket {
        this.destroy()
        return this.socket.disconnect()
    }
    

}
