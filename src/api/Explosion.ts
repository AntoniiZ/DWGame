import { Arc } from './Arc';
import * as GameMap from './GameMapConfig'
export class Explosion extends Arc {

    private maximumRadius: number
    private explosionTimeout: NodeJS.Timeout

    public constructor(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc,  maximumRadius: number,
        speed: number = 0, velocity: Phaser.Geom.Point = new Phaser.Geom.Point(0, 0)){
        super(scene, graphics, shape, speed, velocity)

        this.maximumRadius = maximumRadius
        this.actTowards()
    }

    public move() : void {}
    
    public actTowards() : void {

        if(this.getShape().radius >= this.maximumRadius){
            this.destroy()
            clearTimeout(this.explosionTimeout)
            return
        } 

        this.explosionTimeout = setTimeout(() => {
            this.getShape().radius += GameMap.settings.explosionRadiusAdjustmentValue
            this.draw()
            this.actTowards()
        }, this.getScene().game.loop.actualFps)
        
    }

}