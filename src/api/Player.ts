import { GameObject } from "./GameObject"

export class Player extends GameObject {

    private shape: Phaser.GameObjects.Arc
    private graphics: Phaser.GameObjects.Graphics

    public constructor(scene: Phaser.Scene, displayCoords: Phaser.Geom.Point, speed: number, velocity: Phaser.Geom.Point, bounds: number[], 
        graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc){

        super(scene, displayCoords, speed, velocity, bounds)
        this.shape = shape
        this.graphics = graphics
    }

    public getShape() : Phaser.GameObjects.Arc {
        return this.shape
    }

    protected move() : void {

        if(this.shape.x + this.getVelocity().x * this.getSpeed() >= this.getBounds()[0] && this.shape.x + this.getVelocity().x * this.getSpeed() <= this.getBounds()[2])
        {
            this.shape.x += this.getVelocity().x * this.getSpeed()
        }  

        if(this.shape.y + this.getVelocity().y * this.getSpeed() >= this.getBounds()[1] && this.shape.y + this.getVelocity().y * this.getSpeed() <= this.getBounds()[3])
        {
            this.shape.y += this.getVelocity().y * this.getSpeed()
        }
    }

    protected draw() : void {

        this.graphics.clear().fillStyle(this.shape.fillColor).fillCircle(
            this.getDisplayCoords().x,
            this.getDisplayCoords().y, 
            this.shape.radius
        )
    }
}