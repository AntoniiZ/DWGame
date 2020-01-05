import { Arc } from "./Arc";

export class Food extends Arc {

    public constructor(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc,
        speed: number = 0, velocity: Phaser.Geom.Point = new Phaser.Geom.Point(0, 0)){
        super(scene, graphics, shape, speed, velocity)
    }

    public move() : void {}
    
    public actTowards(arc: Arc) : void 
    {
        let radiusIncrease = (Math.sqrt(arc.getShape().radius**2 + this.getShape().radius**2)) / arc.getShape().radius
        arc.getShape().radius *= radiusIncrease
        this.getScene().cameras.main.zoom /= (Math.sqrt(radiusIncrease))
        this.destroy()
    }

}