export class Point {

    private x: integer
    private y: integer

    public constructor(x: integer, y: integer){
        this.x = x
        this.y = y
    }

    public getX() : integer {
        return this.x
    }

    public getY() : integer {
        return this.y
    }

    public setX(x: integer){
        this.x = x
    }

    public setY(y: integer){
        this.y = y
    }

    public move(velocity: Point){
        this.x += velocity.getX()
        this.y += velocity.getY()
    }

    public getLocation() : Point {
        return new Point(this.x, this.y);
    }
}