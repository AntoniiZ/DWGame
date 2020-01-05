import { Arc } from "./Arc";

export class Explosion extends Arc {

    private maximumRadius: number
    private explosionTimeout: NodeJS.Timeout

    public constructor(scene: Phaser.Scene, speed: number, velocity: Phaser.Geom.Point, bounds: number[], 
        graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc, maximumRadius: number){
            super(scene, speed, velocity, bounds, graphics, shape)
            this.maximumRadius = maximumRadius

            this.actTowards()
    }

    public move() : void {}
    
    public actTowards() : void {

        if(this.getShape().radius >= this.maximumRadius){
            this.destroy()
            clearTimeout(this.explosionTimeout)
        } else {
            this.explosionTimeout = setTimeout(() => {
                this.getShape().radius += 1.5
                this.draw()
                this.actTowards()
            }, this.getScene().game.loop.actualFps)
        }
    }

}