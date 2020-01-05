import { Arc } from "./Arc"
import { game } from "../client/game"

export class PlayerEvents {

    private static onPointerMove(arc: Arc) : void
    {
        const transformedPoint: Phaser.Math.Vector2 = arc.getScene().cameras.main.getWorldPoint(arc.getScene().input.x, arc.getScene().input.y);

        let angle: number = Phaser.Math.Angle.Between(arc.getShape().x, arc.getShape().y, transformedPoint.x, transformedPoint.y)

        arc.setVelocity(Math.cos(angle), Math.sin(angle))
    }

    public static initAll(arc: Arc) : void 
    {
        arc.getScene().input.on('pointermove', () => this.onPointerMove(arc))
    }

}