import { Arc } from "./Arc";
import * as GameMap from "./GameMapConfig"
export class BouncyWall extends Arc {

    public constructor(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc, 
        speed: number = 0, velocity: Phaser.Geom.Point = new Phaser.Geom.Point(0, 0)){
        super(scene, graphics, shape, speed, velocity)
    }

    public move() : void {
        this.getShape().x += this.getVelocity().x * this.getSpeed()
        this.getShape().y += this.getVelocity().y * this.getSpeed()

        let bounds: number[] = GameMap.settings.size

        let copyX: Number = new Number(this.getShape().x)
        let copyY: Number = new Number(this.getShape().y)

        this.getShape().x = Phaser.Math.Clamp(this.getShape().x, -bounds[0]/2 + this.getShape().radius, bounds[0]/2 - this.getShape().radius)
        this.getShape().y = Phaser.Math.Clamp(this.getShape().y, -bounds[1]/2 + this.getShape().radius, bounds[1]/2 - this.getShape().radius)
    }

    public actTowards(arc: Arc) : void {

        this.setSpeed(arc.getSpeed())
        this.setVelocity(arc.getVelocity().x, arc.getVelocity().y)

        arc.getShape().x -= arc.getVelocity().x * arc.getSpeed()
        arc.getShape().y -= arc.getVelocity().y * arc.getSpeed()

        if(arc.getShape().radius > GameMap.settings.playerMinRadius){
            arc.getShape().radius /= GameMap.settings.playerWallRadiusReductionCoef
            this.getScene().cameras.main.zoom *= (Math.sqrt(GameMap.settings.playerWallRadiusReductionCoef))
        }
    }

}
