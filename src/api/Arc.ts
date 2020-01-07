import { GameObject } from "./GameObject"
import * as GameMap from "./GameMapConfig"

export abstract class Arc extends GameObject {

    private shape: Phaser.GameObjects.Arc
    private graphics: Phaser.GameObjects.Graphics

    public constructor(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc, 
        speed: number = 0, velocity: Phaser.Geom.Point = new Phaser.Geom.Point(0, 0)){

        super(scene, speed, velocity)
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

        return shape.x + shape.radius >= cameraWorldView.x && shape.x - shape.radius <= cameraWorldView.x + cameraWorldView.width &&
            shape.y + shape.radius >= cameraWorldView.y && shape.y - shape.radius <= cameraWorldView.y + cameraWorldView.height 
    }

    public abstract move() : void

    public draw() : void {

        this.graphics.clear()

        let newColor: number | Phaser.Types.Display.ColorObject = Phaser.Display.Color.ColorToRGBA(this.shape.fillColor)
        newColor = Phaser.Display.Color.GetColor(
            newColor.r < 255 - GameMap.settings.strokeRGBAdjustment[0] ? newColor.r + GameMap.settings.strokeRGBAdjustment[0] : newColor.r, 
            newColor.g < 255 - GameMap.settings.strokeRGBAdjustment[1] ? newColor.g + GameMap.settings.strokeRGBAdjustment[1] : newColor.g, 
            newColor.b < 255 - GameMap.settings.strokeRGBAdjustment[2] ? newColor.b + GameMap.settings.strokeRGBAdjustment[2] : newColor.b
        )

        this.graphics.fillStyle(this.shape.fillColor).setAlpha(GameMap.settings.drawShapesAlpha)
        .fillCircle(this.shape.x, this.shape.y, this.shape.radius)
        this.graphics.lineStyle(GameMap.settings.strokeLineWidth, newColor)
        .setAlpha(GameMap.settings.drawShapesAlpha).strokeCircle(this.shape.x, this.shape.y, this.shape.radius)
    }

    public collidesWith(arc: Arc) : boolean {
        let playerShape = arc.getShape()
        return Phaser.Math.Distance.Between(this.shape.x, this.shape.y, playerShape.x, playerShape.y)**2 <= 
        (this.shape.radius + playerShape.radius)**2
    }
    
    public destroy() : void {
        this.shape = null
        this.graphics.destroy()
    }

    public abstract actTowards(gameObject?: GameObject) : void
}