import { GameObject } from "./GameObject"

export class Player extends GameObject {

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

    public move() : void {

        if(this.shape.x + this.getVelocity().x * this.getSpeed() >= this.getBounds()[0] && 
        this.shape.x + this.getVelocity().x * this.getSpeed() <= this.getBounds()[2])
        {
            
            this.shape.x += this.getVelocity().x * this.getSpeed()
        }  

        if(this.shape.y + this.getVelocity().y * this.getSpeed() >= this.getBounds()[1] && 
            this.shape.y + this.getVelocity().y * this.getSpeed() <= this.getBounds()[3])
        {
            this.shape.y += this.getVelocity().y * this.getSpeed()
        }     
    }

    public draw() : void {

        this.graphics.clear().fillStyle(this.shape.fillColor)
        
        this.graphics.cameraFilter = this.getScene().cameras.getCamera('labels').id
        
        this.graphics.fillCircle(
            this.shape.x,
            this.shape.y, 
            this.shape.radius
        )
    }

    public collidesWith(player: Player) : boolean {
        let playerShape = player.getShape()
        return Phaser.Math.Distance.Between(this.shape.x, this.shape.y, playerShape.x, playerShape.y)**2 <= (this.shape.radius + playerShape.radius)**2
    }
}