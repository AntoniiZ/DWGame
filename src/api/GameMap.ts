export class GameMap {

    private bounds: number[]

    public constructor(bounds: number[]){
        this.bounds = bounds
    }

    public setBounds(x: number, y: number, x1: number, y1: number) : void {
        this.bounds = [x, y, x1, y1]
    }

    public getBounds() : number[] {
        return this.bounds
    }
    
}