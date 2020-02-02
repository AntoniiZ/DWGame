export abstract class GameObject {

    private speed: number
    private scene: Phaser.Scene
    private velocity: Phaser.Geom.Point
    private displayCoords: Phaser.Geom.Point

    public constructor(scene: Phaser.Scene, speed?: number, velocity?: Phaser.Geom.Point)
    {
        this.scene = scene
        if(speed == null){
            this.speed = 0
        } else {
            this.speed = speed
        }
        if(velocity == null){
            this.velocity = new Phaser.Geom.Point(0, 0)
        } else {
            this.velocity = velocity
        }
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