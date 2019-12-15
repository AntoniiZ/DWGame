import { GameObject } from "./GameObject"
import { game } from "../client/game"

export abstract class Arc extends GameObject {

    private shape: Phaser.GameObjects.Arc
    private graphics: Phaser.GameObjects.Graphics

    public constructor(scene: Phaser.Scene,  speed: number, velocity: Phaser.Geom.Point, bounds: number[], 
        graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc){

        super(scene, speed, velocity, bounds)
        this.shape = shape
        this.graphics = graphics
    }

    public getShape() : Phaser.GameObjects.Arc {
        return this.shape
    }
    
    public canSeeObject(shape: Phaser.GameObjects.Arc) : boolean {
        return shape.x >= this.getScene().cameras.main.scrollX - this.getShape().radius && 
            shape.x <= Number(game.config.width) + this.getScene().cameras.main.scrollX + this.getShape().radius &&
            shape.y >= this.getScene().cameras.main.scrollY - this.getShape().radius && 
            shape.y <= Number(game.config.height) + this.getScene().cameras.main.scrollY + this.getShape().radius
    }

    public move() : void {
        
        if(this.shape.x + this.getVelocity().x * this.getSpeed() / this.getScene().cameras.main.zoom >= this.getBounds()[0] + this.getShape().radius && 
        this.shape.x  + this.getVelocity().x * this.getSpeed() / this.getScene().cameras.main.zoom <= this.getBounds()[2] - this.getShape().radius)
        {
            
            this.shape.x += this.getVelocity().x * this.getSpeed() / this.getScene().cameras.main.zoom
        }  

        if(this.shape.y + this.getVelocity().y * this.getSpeed() / this.getScene().cameras.main.zoom >= this.getBounds()[1] + this.getShape().radius && 
            this.shape.y + this.getVelocity().y * this.getSpeed() / this.getScene().cameras.main.zoom <= this.getBounds()[3] - this.getShape().radius)
        {
            this.shape.y += this.getVelocity().y * this.getSpeed() / this.getScene().cameras.main.zoom
        }     

    }

    public draw() : void {

        this.graphics.clear().fillStyle(this.shape.fillColor).cameraFilter = this.getScene().cameras.getCamera('labels').id

        this.graphics.fillCircle(this.shape.x, this.shape.y, this.shape.radius)
    }

    public collidesWith(arc: Arc) : boolean {
        let playerShape = arc.getShape()
        return Phaser.Math.Distance.Between(this.shape.x, this.shape.y, playerShape.x, playerShape.y)**2 <= 
        (this.shape.radius*0.85 + playerShape.radius*0.85)**2
    }

    public abstract actTowards(gameObject: GameObject) : void
}