import { Arc } from "./Arc";
import { Player } from "./Player";
import { Explosion } from "./Explosion";

export class Food extends Arc {

    public constructor(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc,
        speed?: number, velocity?: Phaser.Geom.Point){
            
        super(scene, graphics, shape, speed, velocity)
    }

    public move() : void {}
    
    public actTowards(arc: Arc) : void 
    {
        if ((arc instanceof Explosion)) {
            this.destroy()
            return
        }
        let radiusIncrease = (Math.sqrt(arc.getShape().radius**2 + this.getShape().radius**2)) / arc.getShape().radius
        arc.getShape().radius *= radiusIncrease
        if(arc instanceof Player){
            this.getScene().cameras.main.zoom /= (Math.sqrt(radiusIncrease))
        }
        this.destroy()
    }

}