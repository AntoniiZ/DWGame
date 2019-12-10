import { Player } from "./Player"
import { game } from "../client/game"

export class PlayerEvents {

    private static onPointerMove(player: Player) : void
    {

        let angle = Phaser.Math.Angle.Between(Number(game.config.width)/2, Number(game.config.height)/2, 
        player.getScene().input.x, player.getScene().input.y)

        player.setVelocity(Math.cos(angle), Math.sin(angle))
    }

    public static initAll(player: Player) : void 
    {
        player.getScene().input.on('pointermove', () => this.onPointerMove(player))
    }

}