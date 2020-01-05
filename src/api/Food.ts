import { Arc } from "./Arc";

export class Food extends Arc {

    public constructor(scene: Phaser.Scene,  speed: number, velocity: Phaser.Geom.Point, bounds: number[], 
        graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc){
            super(scene, speed, velocity, bounds, graphics, shape)
    }

    public move() : void {}
    
    public actTowards(arc: Arc) : void {

        //let bounds: number[] = this.getBounds()

        let radiusIncrease = (Math.sqrt(arc.getShape().radius**2 + this.getShape().radius**2)) / arc.getShape().radius
        arc.getShape().radius *= radiusIncrease
        this.getScene().cameras.main.zoom /= (Math.sqrt(radiusIncrease))
        //this.getScene().cameras.main.zoom -= Math.sqrt(this.getShape().radius)/2

       // this.getShape().setPosition(Phaser.Math.Between(bounds[0], bounds[2]), Phaser.Math.Between(bounds[1], bounds[3]))
        this.destroy()

        //this.draw() 
    }

}