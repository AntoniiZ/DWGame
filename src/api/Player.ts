import { config } from "../client/game"

export class Player {

    private scene: Phaser.Scene
    private shape: Phaser.GameObjects.Arc
    private velocity: Phaser.Geom.Point
    private color: number
    private speed : number

    public constructor(scene: Phaser.Scene, shape: Phaser.GameObjects.Arc){
        this.scene = scene
        this.shape = shape
        this.velocity = new Phaser.Geom.Point(0, 0)
        this.color = 0xFFFFFF
        this.speed = 10
        
    }

    public setVelocity(x: number, y: number) : void {
        this.velocity = new Phaser.Geom.Point(x, y)
    }

    public getVelocity() : Phaser.Geom.Point {
        return this.velocity
    }

    public setSpeed(speed: number) : void {
        this.speed = speed
    }

    public getSpeed() : number {
        return this.speed
    }

    public move(velocity: Phaser.Geom.Point) : void {
        this.shape.x += this.velocity.x * this.speed
        this.shape.y += this.velocity.y * this.speed
    }

    public getLocation() : Phaser.Geom.Point {
        return new Phaser.Geom.Point(this.shape.x, this.shape.y)
    }
}