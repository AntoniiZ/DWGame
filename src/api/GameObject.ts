import { GameMap } from "./GameMap"

export abstract class GameObject extends GameMap {

    private speed: number
    private scene: Phaser.Scene
    private velocity: Phaser.Geom.Point
    private displayCoords: Phaser.Geom.Point

    public constructor(scene: Phaser.Scene, speed: number, velocity: Phaser.Geom.Point, bounds: number[])
    {
        super(bounds)
        this.scene = scene
        this.speed = speed
        this.velocity = velocity
    }

    public getScene() : Phaser.Scene {
        return this.scene
    }
    
    public setVelocity(x: number, y: number): void {
        this.velocity = new Phaser.Geom.Point(x, y)
    }

    public getVelocity(): Phaser.Geom.Point {
        return this.velocity
    }

    public setSpeed(value: number): void {
        this.speed = value
    }

    public getSpeed(): number {
        return this.speed
    }

    protected abstract move() : void

    protected abstract draw() : void

    protected abstract collidesWith(gameObject: GameObject) : boolean
}