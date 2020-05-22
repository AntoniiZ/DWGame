import { Arc } from "./Arc"
import { Player } from "./Player"
import { Food } from "./Food";
import { BouncyWall } from "./BouncyWall";
import { Explosion } from "./Explosion";
import * as GameMap from "../api/GameMapConfig";

export class PlayerEvents {

    private static onPointerMove(player: Player) : void
    {
        const transformedPoint: Phaser.Math.Vector2 = player.getScene().cameras.main.getWorldPoint(
            player.getScene().input.x, 
            player.getScene().input.y
        );

        if(new Phaser.Geom.Circle(player.getShape().x, player.getShape().y, player.getShape().radius)
            .contains(transformedPoint.x, transformedPoint.y)){
            player.setVelocity(0, 0)
            return;
        }
        let angle: number = Phaser.Math.Angle.Between(player.getShape().x, player.getShape().y, transformedPoint.x, transformedPoint.y)

        player.setVelocity(Math.cos(angle), Math.sin(angle))
    }
    private static onPointerMoveSpectator(player: Player) : void
    {
        const transformedPoint: Phaser.Math.Vector2 = player.getScene().cameras.main.getWorldPoint(
            player.getScene().input.x, 
            player.getScene().input.y
        );

        player.getShape().setPosition(transformedPoint.x, transformedPoint.y)
    }
    private static spawnPlayer(player: Player) : void 
    {
        player.getSocket().on('spawnPlayer', (data: any) => {

            let scene: Phaser.Scene = player.getScene()
            let graphics: Phaser.GameObjects.Graphics = scene.add.graphics()
            let shape: Phaser.GameObjects.Arc = new Phaser.GameObjects.Arc(scene)
            let velocity: Phaser.Geom.Point = new Phaser.Geom.Point(data.vel.x, data.vel.y)

            shape.setPosition(data.x, data.y).setRadius(data.radius).setFillStyle(data.color)

            player.getOtherPlayers().set(
                data.id, 
                new Player(null, data.username, scene, graphics, shape, data.speed, velocity)
            )
        })
    }
    private static updatePlayer(player: Player) : void 
    {
        player.getSocket().on('updatePlayer', (data: any) => {

            if(!player.getOtherPlayers().has(data.id) || data.id == player.getSocket().id){
                return
            }

            let updatedPlayer: Player = player.getOtherPlayers().get(data.id)
            let updatedPlayerShape: Phaser.GameObjects.Arc = updatedPlayer.getShape()
            updatedPlayerShape.x = data.x
            updatedPlayerShape.y = data.y
            updatedPlayerShape.radius = data.radius
            updatedPlayerShape.fillColor = data.color
            updatedPlayer.setSpeed(data.speed)
            updatedPlayer.setVelocity(data.vel.x, data.vel.y)
        })
    } 
    
    private static disconnectPlayer(player: Player) : void 
    {
        player.getSocket().on('disconnectPlayer', (data: string) => {
            if(!player.getOtherPlayers().has(data)){
                return
            }
            let deletedPlayer: Player = player.getOtherPlayers().get(data)

            deletedPlayer.destroy()

            player.getOtherPlayers().delete(data)
        })
    }
    private static spawnObject(player: Player) : void
    {
        player.getSocket().on('spawnObject', (data: any) => {

            //console.log(`Client: received object at ${data.x}:${data.y}`)
            let scene: Phaser.Scene = player.getScene()
            let objects: Map<string, Arc> = player.getObjects()
            let color: number = Phaser.Display.Color.GetColor(data.color[0], data.color[1], data.color[2])
            
            let shape: Phaser.GameObjects.Arc = new Phaser.GameObjects.Arc (
                scene, 
                data.x, 
                data.y, 
                data.radius
            ).setFillStyle(color)

            data.randomNum ? 
                objects.set(data.id, new Food(scene, scene.add.graphics(), shape)) : 
                objects.set(data.id, new BouncyWall(scene, scene.add.graphics(), shape))
        })
    }
    private static updateObject(player: Player) : void
    {
        player.getSocket().on('updateObject', (data: any) => {
            
            let objects: Map<string, Arc> = player.getObjects()
            if(!objects.has(data.id)){
                return
            }
            let object: Arc = objects.get(data.id)
            if(object.getShape() == null)
            {
                return
            }
            object.setSpeed(data.speed)
            object.setVelocity(data.vel.x, data.vel.y)
            object.getShape().setPosition(data.x, data.y).setRadius(data.radius)
        })
    }
    private static destroyObject(player: Player) : void
    {
        player.getSocket().on('destroyObject', (data: any) => {
            let objects: Map<string, Arc> = player.getObjects()
            if(!objects.has(data.id)){
                return
            }
            objects.get(data.id).destroy()
            objects.delete(data.id)
        })
    }
    private static createExplosion(player: Player) : void
    {
        player.getSocket().on('createExplosion', (data: any) => {
            let scene: Phaser.Scene = player.getScene()
            new Explosion(
                scene, 
                scene.add.graphics(), 
                new Phaser.GameObjects.Arc(
                    scene,
                    data.x,
                    data.y,
                    data.radius
                ).setFillStyle(GameMap.settings.explosionColorRange),
                data.maximumRadius,
                player
            )
        })
    }
    private static getSecondsPassed(player: Player) : void
    {
        player.getSocket().on('secondsPassed', (secondsPassed: number) => {
            player.setSecondsPassed(secondsPassed)
        })
    }
    private static initAllSocket(player: Player): void {
        this.spawnPlayer(player)
        this.updatePlayer(player)
        this.disconnectPlayer(player)
        this.spawnObject(player)
        this.updateObject(player)
        this.destroyObject(player)
        this.createExplosion(player)
        this.getSecondsPassed(player);
    }
    
    public static initAll(player: Player) : void 
    {
        this.initAllSocket(player)

        player.getScene().input.on('pointermove', () => this.onPointerMove(player))
    }

    public static initAllSpectator(player: Player) : void 
    {
        this.initAllSocket(player)

        player.getScene().input.on('pointermove', () => this.onPointerMoveSpectator(player))
    }

}