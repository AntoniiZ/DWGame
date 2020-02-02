import { Arc } from "./Arc";
import { Food } from "./Food";
import { BouncyWall } from "./BouncyWall";
import * as GameMap from "./GameMapConfig"
import * as config from "../server/config"
export class Player extends BouncyWall {

    private objects: Arc[] = []
    private socket: SocketIOClient.Socket
    private players: Map<string, Player> = new Map()

    public constructor(socket: SocketIOClient.Socket, scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc, 
        speed?: number, velocity?: Phaser.Geom.Point){
        
        super(scene, graphics, shape, speed, velocity)

        this.socket = socket
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

    public updatePlayer(): SocketIOClient.Socket {

        let shape: Phaser.GameObjects.Arc = this.getShape()
        return this.socket.emit('updatePlayer', {
            'x': shape.x,
            'y': shape.y,
            'radius': shape.radius,
            'color': shape.fillColor
        })
    }
    public updateObject(index: number, object: Arc): SocketIOClient.Socket {

        let shape: Phaser.GameObjects.Arc = object.getShape()

        return this.socket.emit('updateObject', {
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

    public destroyObject(index: number): SocketIOClient.Socket {
        
        return this.socket.emit('destroyObject', {
            index: index
        })
    }

    public getOtherPlayers(): Map<string, Player> {
        return this.players
    }

    public getObjects() : Arc[] {
        return this.objects
    }

    public spawnRandomObject(): SocketIOClient.Socket {
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
        
        return this.socket.emit('spawnRandomObject', {
            'randomNum' : randomNum,
            'scene': this.getScene().scene.key,
            'graphics': newArc.getGraphics(),
            'shape': newArc.getShape()
        })

    }

    public disconnect() : SocketIOClient.Socket {
        this.destroy()
        for(let i = 0; i < this.objects.length; i++){
            if(this.objects[i] == null){
                continue
            }
            this.objects[i].destroy()
            this.objects[i] = null
        }
        return this.socket.disconnect()
    }
    

}
