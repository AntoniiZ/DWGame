import { Arc } from "./Arc"
import { game } from "../client/game"

export class PlayerEvents {

    private static onPointerMove(arc: Arc) : void
    {

        let angle = Phaser.Math.Angle.Between(
            Number(game.config.width)/2, 
            Number(game.config.height)/2, 
            arc.getScene().input.x, 
            arc.getScene().input.y
        )
        arc.setVelocity(Math.cos(angle), Math.sin(angle))
    }

    public static initAll(arc: Arc) : void 
    {
        arc.getScene().input.on('pointermove', () => this.onPointerMove(arc))
    }

}