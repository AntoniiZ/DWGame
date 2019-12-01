import { config } from "../game"
import { GameMap } from "../../api/GameMap";
import { Player } from "../../api/Player";

export class MainScene extends Phaser.Scene
{
    private player: Player
    private gameMap: GameMap = new GameMap(Number(config.scale.width), Number(config.scale.height))
    
    public constructor()
    {
        super("MainScene")
    }

    public create() : void 
    {
        let shape: Phaser.GameObjects.Arc = this.add.circle(50, 50, 100, 0xffffff)
        this.player = new Player(this, shape)

        this.input.on('pointermove', function(){
            let angle : number = Phaser.Math.Angle.Between(shape.x, shape.y, this.input.x + this.cameras.main.scrollX, this.input.y + this.cameras.main.scrollY)
            this.player.setVelocity(Math.cos(angle), Math.sin(angle))

        }, this);


        this.cameras.main.startFollow(shape)
        this.add.rectangle(550, 550, 300, 300, 0xff00ff)
    }

    public update() : void 
    {
        this.player.move(this.player.getVelocity())
        console.log(`| ${this.player.getLocation().x};${this.player.getLocation().y} |`)
    }

}