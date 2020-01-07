import * as GameMap from "./GameMapConfig"
import { BouncyWall } from "./BouncyWall";

export class Player extends BouncyWall {

    private socketId: string

    public constructor(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc, 
        speed: number = 0, socketId: string, velocity: Phaser.Geom.Point = new Phaser.Geom.Point(0, 0)){
        
        super(scene, graphics, shape, speed, velocity)

        this.socketId = socketId
    }

    public move() : void {
        super.move()
    }

    public getSocketId() : string {
        return this.socketId
    }

    public spawnPlayer(socket: SocketIOClient.Socket): SocketIOClient.Socket {
        return socket.emit('spawnPlayer', {
            'scene': this.getScene().scene.key,
            'graphics': this.getGraphics(),
            'shape': this.getShape(),
            'speed': this.getSpeed(),
            'velocity': this.getVelocity()
        })
    }

    public updatePlayer(socket: SocketIOClient.Socket): SocketIOClient.Socket {

        let shape: Phaser.GameObjects.Arc = this.getShape()

        return socket.emit('updatePlayer', {
            'id': this.socketId,
            'x': shape.x,
            'y': shape.y,
            'radius': shape.radius
        })
    }
    

}
