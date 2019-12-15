import { game } from "../game"
import { Arc } from "../../api/Arc";
import { Food } from "../../api/Food";
import { BouncyWall } from "../../api/BouncyWall";
import { GameMap } from "../../api/GameMap";
import { PlayerEvents } from "../../api/PlayerEvents";

export class MainScene extends Phaser.Scene
{
    private player: Arc
    private gameMap: GameMap
    private testplayers: Arc[] = []
    private coordinatesInfo: Phaser.GameObjects.Text
    private labelsCamera: Phaser.Cameras.Scene2D.Camera

    public constructor()
    {
        super("MainScene")
    }

    public preload() : void 
    {
        //this.load.image('background', '../../assets/a2.jpg')
    }

    public create() : void 
    { 

        this.gameMap = new GameMap([-3000, -3000, 3000, 3000])
        let gameMapBounds = this.gameMap.getBounds();
        
        this.labelsCamera = this.cameras.add(0, 0, game.scale.width, game.scale.height, false, 'labels')

        this.player = new BouncyWall(
            /* scene */             this,
            /* speed */             10, 
            /* velocity */          new Phaser.Geom.Point(0, 0), 
            /* bounds */            this.gameMap.getBounds(), 
            /* graphicsObject */    this.add.graphics(), 
            /* body/shape */        new Phaser.GameObjects.Arc(this, 0, 0, 100).setFillStyle(0xaffffa), 
        )
        

        for(let i = 0; i < 100; i++){
            this.testplayers.push(new Food(
                /* scene */             this,
                /* speed */             1, 
                /* velocity */          new Phaser.Geom.Point(0, 0), 
                /* bounds */            this.gameMap.getBounds(), 
                /* graphicsObject */    this.add.graphics(), 
                /* body/shape */        new Phaser.GameObjects.Arc(this, 
                                            Phaser.Math.Between(gameMapBounds[0], gameMapBounds[2]),
                                             Phaser.Math.Between(gameMapBounds[1], gameMapBounds[3]), Phaser.Math.Between(25, 70))
                                             .setFillStyle(Phaser.Display.Color.GetColor(0, 0, Phaser.Math.Between(155, 255))), 
            ))
            this.testplayers.push(new BouncyWall(
                /* scene */             this,
                /* speed */             1, 
                /* velocity */          new Phaser.Geom.Point(0, 0), 
                /* bounds */            this.gameMap.getBounds(), 
                /* graphicsObject */    this.add.graphics(), 
                /* body/shape */        new Phaser.GameObjects.Arc(this, 
                                            Phaser.Math.Between(gameMapBounds[0], gameMapBounds[2]),
                                             Phaser.Math.Between(gameMapBounds[1], gameMapBounds[3]), Phaser.Math.Between(50, 70))
                                             .setFillStyle(Phaser.Display.Color.GetColor(Phaser.Math.Between(155, 255), 0, 0)), 
            ))
        }

        let shape = this.player.getShape() // The secondary camera ignores the main player we control

        this.cameras.main.setBounds(
            gameMapBounds[0], 
            gameMapBounds[1], 
            gameMapBounds[2] - gameMapBounds[0], 
            gameMapBounds[3] - gameMapBounds[1]
        )

        PlayerEvents.initAll(this.player)

        this.coordinatesInfo = this.add.text(50, 50, '').setFontSize(30)
        this.coordinatesInfo.setScrollFactor(0, 0)
        
        this.cameras.main.startFollow(shape, true, 0.1, 0.1) // The main camera follows the player we control
        this.cameras.main.ignore(this.coordinatesInfo) // The main camera ignores texts
    }

    public update() : void 
    {
        this.player.move()

        for(let i : number = 0; i < this.testplayers.length; i++){
            if(this.player.canSeeObject(this.testplayers[i].getShape())){
                if(this.player.collidesWith(this.testplayers[i])){
                    this.testplayers[i].actTowards(this.player)
                }
                this.testplayers[i].draw()
            }
        }
    
        this.player.draw()
        this.debug()
    }

    private debug() : void 
    {
        this.coordinatesInfo.setText( `{x, y, radius, camera} => {${Math.floor(this.player.getShape().x)},  ${Math.floor(this.player.getShape().y)},  ${Math.floor(this.player.getShape().radius)}}| ${this.cameras.main.zoom}, ${Math.floor(this.cameras.main.scrollX)}, ${Math.floor(this.cameras.main.scrollY)} |`)
    }
    
}