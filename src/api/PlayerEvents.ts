import { Arc } from "./Arc"
import { Player } from "./Player"
import { game } from "../client/game";
import { Food } from "./Food";
import { BouncyWall } from "./BouncyWall";

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

    private static spawnPlayer(player: Player, socket: SocketIOClient.Socket) : void 
    {
        socket.on('spawnPlayer', (data: any) => {

            let scene: Phaser.Scene = game.scene.getScene(data.scene)
            let shape: Phaser.GameObjects.Arc = new Phaser.GameObjects.Arc(scene)
            let graphics: Phaser.GameObjects.Graphics = new Phaser.GameObjects.Graphics(scene)

            player.getOtherPlayers().set(
                data.id,
                new Player(
                    scene,
                    scene.add.graphics(),
                    Object.assign(shape, data.shape),
                    data.speed,
                    data.id,
                    data.velocity
                )
            )
        })
    }
    private static getConnectedPlayers(player: Player, socket: SocketIOClient.Socket) : void 
    {
        socket.on('getPlayer', (data: any) => {
            
            let otherPlayer = data.player
            let scene: Phaser.Scene = game.scene.getScene(data.player.scene)
            let shape: Phaser.GameObjects.Arc = new Phaser.GameObjects.Arc(scene)
            let graphics: Phaser.GameObjects.Graphics = new Phaser.GameObjects.Graphics(scene)

            player.getOtherPlayers().set(data.id, 
                new Player(
                    scene,
                    scene.add.graphics(),
                    Object.assign(shape, otherPlayer.shape),
                    otherPlayer.speed,
                    otherPlayer.socketId,
                    otherPlayer.velocity
                )
            )
        })
    }
    private static updatePlayer(player: Player, socket: SocketIOClient.Socket) : void 
    {
        socket.on('updatePlayer', (data: any) => {

            if(!player.getOtherPlayers().has(data.id)){
                return
            }

            let updatedPlayer: Player = player.getOtherPlayers().get(data.id)
            let updatedPlayerShape: Phaser.GameObjects.Arc = updatedPlayer.getShape()
            updatedPlayerShape.x = data.x
            updatedPlayerShape.y = data.y
            updatedPlayerShape.radius = data.radius
            updatedPlayerShape.fillColor = data.color
        })
    } 
    
    private static disconnectPlayer(player: Player, socket: SocketIOClient.Socket) : void 
    {
        socket.on('disconnectPlayer', (data: string) => {
            let deletedPlayer: Player = player.getOtherPlayers().get(data)
            deletedPlayer.getGraphics().destroy()

            let shape: Phaser.GameObjects.Shape = deletedPlayer.getShape()
            shape = null

            player.getOtherPlayers().delete(data)
        })
    }

    public static initAll(player: Player, socket: SocketIOClient.Socket) : void 
    {
        this.getConnectedPlayers(player, socket)
        this.spawnPlayer(player, socket)
        this.updatePlayer(player, socket)
        this.disconnectPlayer(player, socket)

        player.getScene().input.on('pointermove', () => this.onPointerMove(player))
    }

}