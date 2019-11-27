import { Point } from './Point';

export abstract class Shape extends Point {

    private location: Point
    private velocity: Point
    private timeCoef: integer

    public constructor(location: Point){
        super(location.getX(), location.getY())
        
        /// add config for these defaults
        this.timeCoef = 0.5 * 1000
        this.velocity = new Point(0, 0)
        ///
    }

    public update() : void {
        this.move(this.velocity)

        this.act()

        setTimeout(this.update, this.timeCoef);
    }

    public abstract act() : void
    public abstract draw() : void 
    public abstract intersects(shape: Shape) : boolean
    //// add more methods
}