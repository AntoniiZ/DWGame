import { Arc } from "./Arc";

export class BouncyWall extends Arc {

    public constructor(scene: Phaser.Scene,  speed: number, velocity: Phaser.Geom.Point, bounds: number[], 
        graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc){
            super(scene, speed, velocity, bounds, graphics, shape)
    }

    public actTowards(arc: Arc) : void {
        arc.getShape().x -= arc.getVelocity().x * arc.getSpeed() / this.getScene().cameras.main.zoom 
        arc.getShape().y -= arc.getVelocity().y * arc.getSpeed() / this.getScene().cameras.main.zoom

        if(arc.getShape().radius > 25){
            arc.getShape().radius /= 1.01125
            this.getScene().cameras.main.zoom *= (Math.sqrt(1.01125))
        }
        arc.setVelocity(0, 0);
    }

}

/// zoom 2, vrR*2, myR*2
/// radius 2