import { Player } from "./Player"
import { game } from "../client/game";
import 'babel-polyfill'

export class PlayerEvents {

    private static onPointerMove(player: Player) : void
    {
        const transformedPoint: Phaser.Math.Vector2 = player.getScene().cameras.main.getWorldPoint(
            player.getScene().input.x, 
            player.getScene().input.y
        );

        let angle: number = Phaser.Math.Angle.Between(player.getShape().x, player.getShape().y, transformedPoint.x, transformedPoint.y)

        player.setVelocity(Math.cos(angle), Math.sin(angle))
    }

    public static async getConnectedPlayers(socket: SocketIOClient.Socket) : Promise<Map<string, Player>> {
        return new Promise((resolve, reject) => {
            socket.on('getPlayers', (data: Map<string, Player>) => resolve(data))
        })
    }

    public static initAll(player: Player) : void 
    {
        player.getScene().input.on('pointermove', () => this.onPointerMove(player))
    }

}