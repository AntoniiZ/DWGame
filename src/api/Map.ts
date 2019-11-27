export class Map {
    
    private width: integer
    private height: integer

    public constructor(width: integer, height: integer){
        this.width = width;
        this.height = height;
    }

    public getWidth() : integer {
        return this.width
    }

    public getHeight() : integer {
        return this.height
    }

}