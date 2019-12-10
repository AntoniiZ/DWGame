export abstract class GameObject {

    private scene: Phaser.Scene
    private speed: number
    private bounds: number[]
    private velocity: Phaser.Geom.Point
    private displayCoords: Phaser.Geom.Point

    public constructor(scene: Phaser.Scene, displayCoords: Phaser.Geom.Point, speed: number, velocity: Phaser.Geom.Point, bounds: number[])
    {
        this.scene = scene
        this.speed = speed
        this.bounds = bounds
        this.velocity = velocity
        this.displayCoords = displayCoords
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

    public setBounds(x: number, y: number, x1: number, y1: number) : void {
        this.bounds = [x, y, x1, y1]
    }

    public getBounds() : number[] {
        return this.bounds
    }

    public getDisplayCoords(): Phaser.Geom.Point {
        return this.displayCoords
    }

    public update() : void {
        this.move()
        this.draw()
    }

    protected abstract move() : void

    protected abstract draw() : void
}