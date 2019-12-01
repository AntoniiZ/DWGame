export class GameMap {
    
    private width: string | number
    private height: string | number

    public constructor(width: string | number, height: string | number){
        this.width = width;
        this.height = height;
    }

    public getWidth() : string | number {
        return this.width
    }

    public getHeight() : string | number {
        return this.height
    }

}