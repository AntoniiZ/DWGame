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

    public getGraphics() : Phaser.GameObjects.Graphics {
        return this.graphics
    }
    
    public getShape() : Phaser.GameObjects.Arc {
        return this.shape
    }
    
    public canSeeObject(arc: Arc) : boolean {

        let shape = arc.getShape()
        let cameraWorldView : Phaser.Geom.Rectangle = this.getScene().cameras.main.worldView

        //return cameraWorldView.contains(arc.getShape().x, arc.getShape().y)

        return shape.x + shape.radius >= cameraWorldView.x && shape.x - shape.radius <= cameraWorldView.x + cameraWorldView.width &&
            shape.y + shape.radius >= cameraWorldView.y && shape.y - shape.radius <= cameraWorldView.y + cameraWorldView.height 
    }

    public abstract move() : void

    public draw() : void {

        this.graphics.clear().fillStyle(this.shape.fillColor).cameraFilter = this.getScene().cameras.getCamera('labels').id

        let newColor: number | Phaser.Types.Display.ColorObject = Phaser.Display.Color.ColorToRGBA(this.shape.fillColor)
        newColor = Phaser.Display.Color.GetColor(
            newColor.r < 240 ? newColor.r + 15 : newColor.r, 
            newColor.g < 240 ? newColor.g + 15 : newColor.g, 
            newColor.b < 240 ? newColor.b + 15 : newColor.b
        )

        this.graphics.lineStyle(5, newColor).setAlpha(1)
        
        this.graphics.strokeCircle(this.shape.x, this.shape.y, this.shape.radius)

        this.graphics.fillCircle(this.shape.x, this.shape.y, this.shape.radius).setAlpha(0.9)
    }

    public collidesWith(arc: Arc) : boolean {
        let playerShape = arc.getShape()
        return Phaser.Math.Distance.Between(this.shape.x, this.shape.y, playerShape.x, playerShape.y)**2 <= 
        (this.shape.radius + playerShape.radius)**2
    }
    
    public destroy() : void {
        this.graphics.destroy()
        this.shape = null
    }

    public abstract actTowards(gameObject?: GameObject) : void
}