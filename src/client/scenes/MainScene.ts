import { GameMap } from "../../api/GameMap";
import { config } from "../game"

export class MainScene extends Phaser.Scene
{

    private gameMap: GameMap = new GameMap(config.scale.width, config.scale.height)

    public constructor(){
        super("MainScene")
    }

    public create() : void {
        console.log(this.gameMap);
    }

    public update() : void {
    }

}