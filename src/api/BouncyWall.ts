import { Arc } from "./Arc";
import * as GameMap from "./GameMapConfig"
import { game } from "../client/game";

export class BouncyWall extends Arc {

    public constructor(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc, 
        speed: number = 0, velocity: Phaser.Geom.Point = new Phaser.Geom.Point(0, 0)){
        super(scene, graphics, shape, speed, velocity)
    }

    public move() : void {

        let bounds: number[] = GameMap.settings.size
        
        this.getShape().x += this.getVelocity().x * this.getSpeed()
        this.getShape().y += this.getVelocity().y * this.getSpeed()

        if (this.getShape().x <= -bounds[0] / 2 + this.getShape().radius) {
            this.getShape().x = -bounds[0] / 2 + this.getShape().radius
            this.setVelocity(-this.getVelocity().x, this.getVelocity().y)
        }
        else if (this.getShape().x >= bounds[0] / 2 - this.getShape().radius) {
            this.getShape().x = bounds[0] / 2 - this.getShape().radius
            this.setVelocity(-this.getVelocity().x, this.getVelocity().y)
        }

        if (this.getShape().y <= -bounds[1] / 2 + this.getShape().radius) {
            this.getShape().y = -bounds[1] / 2 + this.getShape().radius
            this.setVelocity(this.getVelocity().x, -this.getVelocity().y)

        }
        else if (this.getShape().y >= bounds[1] / 2 - this.getShape().radius) {
            this.getShape().y = bounds[1] / 2 - this.getShape().radius
            this.setVelocity(this.getVelocity().x, -this.getVelocity().y)
        }

    }

    public actTowards(arc: Arc) : void {

        this.setSpeed(arc.getSpeed()/(this.getShape().radius / arc.getShape().radius))
        this.setVelocity(arc.getVelocity().x, arc.getVelocity().y)

        arc.getShape().x -= arc.getVelocity().x * arc.getSpeed()*2
        arc.getShape().y -= arc.getVelocity().y * arc.getSpeed()*2

        if(arc.getShape().radius > GameMap.settings.playerMinRadius){
            arc.getShape().radius /= GameMap.settings.playerWallRadiusReductionCoef
            this.getScene().cameras.main.zoom *= (Math.sqrt(GameMap.settings.playerWallRadiusReductionCoef))
        }
    }

}
