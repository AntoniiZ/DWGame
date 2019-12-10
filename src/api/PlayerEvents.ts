import { Player } from "./Player"
import { game } from "../client/game"

export class PlayerEvents {

    private static onPointerMove(player: Player) : void
    {

        let angle = Phaser.Math.Angle.Between(player.getShape().x, player.getShape().y, 
        player.getScene().input.x + player.getScene().cameras.main.scrollX, 
        player.getScene().input.y + player.getScene().cameras.main.scrollY)

        player.setVelocity(Math.cos(angle), Math.sin(angle))
    }

    public static initAll(player: Player) : void 
    {
        player.getScene().input.on('pointermove', () => this.onPointerMove(player))
    }

}