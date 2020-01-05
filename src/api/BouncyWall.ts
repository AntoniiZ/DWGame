import { Arc } from "./Arc";

export class BouncyWall extends Arc {

    public constructor(scene: Phaser.Scene,  speed: number, velocity: Phaser.Geom.Point, bounds: number[], 
        graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc){
            super(scene, speed, velocity, bounds, graphics, shape)
    }

    public move() : void {
        this.getShape().x += this.getVelocity().x * this.getSpeed()
        this.getShape().y += this.getVelocity().y * this.getSpeed()

        let bounds: number[] = this.getBounds()

        let copyX: Number = new Number(this.getShape().x)
        let copyY: Number = new Number(this.getShape().y)

        this.getShape().x = Phaser.Math.Clamp(this.getShape().x, bounds[0] + this.getShape().radius, bounds[2] - this.getShape().radius)
        this.getShape().y = Phaser.Math.Clamp(this.getShape().y, bounds[1] + this.getShape().radius, bounds[3] - this.getShape().radius)
    }

    public actTowards(arc: Arc) : void {

        this.setSpeed(arc.getSpeed())
        this.setVelocity(arc.getVelocity().x, arc.getVelocity().y)

        arc.getShape().x -= arc.getVelocity().x * arc.getSpeed()
        arc.getShape().y -= arc.getVelocity().y * arc.getSpeed()

        if(arc.getShape().radius > 25){
            arc.getShape().radius /= 1.21125
            this.getScene().cameras.main.zoom *= (Math.sqrt(1.21125))
        }
    }

}
