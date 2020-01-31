import { Arc } from "./Arc";
import { Food } from "./Food";
import { BouncyWall } from "./BouncyWall";
import * as GameMap from "./GameMapConfig"

export class Player extends BouncyWall {

    private socketId: string
    private objects: Arc[] = []
    private players: Map<string, Player> = new Map()

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
        let shape: Phaser.GameObjects.Arc = this.getShape()
        return socket.emit('spawnPlayer', {
            'x': shape.x,
            'y': shape.y,
            'radius': shape.radius,
            'color': shape.fillColor,
            'speed': this.getSpeed(),
            'vel': {
                'x': this.getVelocity().x,
                'y': this.getVelocity().y
            }
        })
    }

    public updatePlayer(socket: SocketIOClient.Socket): SocketIOClient.Socket {

        let shape: Phaser.GameObjects.Arc = this.getShape()
        return socket.emit('updatePlayer', {
            'x': shape.x,
            'y': shape.y,
            'radius': shape.radius,
            'color': shape.fillColor
        })
    }
    public updateObject(index: number, object: Arc, socket: SocketIOClient.Socket): SocketIOClient.Socket {

        let shape: Phaser.GameObjects.Arc = object.getShape()

        return socket.emit('updateObject', {
            index: index,
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

    public destroyObject(index: number, socket: SocketIOClient.Socket): SocketIOClient.Socket {
        
        return socket.emit('destroyObject', {
            index: index
        })
    }

    public getOtherPlayers(): Map<string, Player> {
        return this.players
    }

    public getObjects() : Arc[] {
        return this.objects
    }

    public spawnRandomObject(socket: SocketIOClient.Socket): SocketIOClient.Socket {
        let randomNum: number = Phaser.Math.Between(0, 1)

        let randomRadius = randomNum ? 
            Phaser.Math.Between(GameMap.settings.foodRadiusRange[0], GameMap.settings.foodRadiusRange[1]) : 
            Phaser.Math.Between(GameMap.settings.wallsRadiusRange[0], GameMap.settings.wallsRadiusRange[1])

        let randomColor = randomNum ? 
            Phaser.Display.Color.GetColor(
                Phaser.Math.Between(GameMap.settings.foodColorRange[0][0], GameMap.settings.foodColorRange[0][1]),
                Phaser.Math.Between(GameMap.settings.foodColorRange[1][0], GameMap.settings.foodColorRange[1][1]),
                Phaser.Math.Between(GameMap.settings.foodColorRange[2][0], GameMap.settings.foodColorRange[2][1])
            ) : 
            Phaser.Display.Color.GetColor(
                Phaser.Math.Between(GameMap.settings.wallsColorRange[0][0], GameMap.settings.wallsColorRange[0][1]),
                Phaser.Math.Between(GameMap.settings.wallsColorRange[1][0], GameMap.settings.wallsColorRange[1][1]),
                Phaser.Math.Between(GameMap.settings.wallsColorRange[2][0], GameMap.settings.wallsColorRange[2][1])
            )

        let randomX = Phaser.Math.Between(-GameMap.settings.size[0]/2 + randomRadius, GameMap.settings.size[0]/2 - randomRadius)
        let randomY = Phaser.Math.Between(-GameMap.settings.size[1]/2 + randomRadius, GameMap.settings.size[1]/2 - randomRadius)

        let newArc: Arc = randomNum ? 
            new Food(
                this.getScene(), 
                this.getScene().add.graphics(), 
                new Phaser.GameObjects.Arc(this.getScene(), randomX, randomY, randomRadius).setFillStyle(randomColor)
            ) :
            new BouncyWall(
                this.getScene(), 
                this.getScene().add.graphics(), 
                new Phaser.GameObjects.Arc(this.getScene(), randomX, randomY, randomRadius).setFillStyle(randomColor)
            ) 
        
        return socket.emit('spawnRandomObject', {
            'randomNum' : randomNum,
            'scene': this.getScene().scene.key,
            'graphics': newArc.getGraphics(),
            'shape': newArc.getShape()
        })

    }
    

}
