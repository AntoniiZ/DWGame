import { game } from "../game"
import { Player } from "../../api/Player";
import { PlayerEvents } from "../../api/PlayerEvents";

export class MainScene extends Phaser.Scene
{
    private player: Player
    private coordinatesInfo: Phaser.GameObjects.Text
    private graphicsPlayer: Phaser.GameObjects.Graphics

    public constructor()
    {
        super("MainScene")
    }

    public create() : void 
    {  
        this.player = new Player(
            /* scene */             this,
            /* displayCoords */     new Phaser.Geom.Point(Number(game.config.width)/2, Number(game.config.height)/2),
            /* speed */             10, 
            /* velocity */          new Phaser.Geom.Point(0, 0), 
            /* bounds */            [-2000, -2000, 2000, 2000], 
            /* graphicsObject */    this.add.graphics(), 
            /* body/shape */        new Phaser.GameObjects.Arc(this, 0, 0, 200).setFillStyle(0xfffff), 
        )

        PlayerEvents.initAll(this.player)
        
        this.coordinatesInfo = this.add.text(50, 50, '').setFontSize(30)
    }

    public update() : void 
    {
        this.player.update()

        this.debug()
    }

    private debug() : void 
    {
        this.coordinatesInfo.setText(`{x, y} => {${Math.floor(this.player.getShape().x)}, ${Math.floor(this.player.getShape().y)}}`)
    }
    
}