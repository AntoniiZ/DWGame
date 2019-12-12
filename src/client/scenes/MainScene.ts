import { game } from "../game"
import { Player } from "../../api/Player";
import { GameMap } from "../../api/GameMap";
import { PlayerEvents } from "../../api/PlayerEvents";

export class MainScene extends Phaser.Scene
{
    private player: Player
    private gameMap: GameMap
    private testplayers: Player[] = []
    private coordinatesInfo: Phaser.GameObjects.Text
    private labelsCamera: Phaser.Cameras.Scene2D.Camera

    public constructor()
    {
        super("MainScene")
    }

    public create() : void 
    {  

        this.gameMap = new GameMap([-3000, -3000, 3000, 3000])
        let gameMapBounds = this.gameMap.getBounds();
        
        this.labelsCamera = this.cameras.add(0, 0, game.scale.width, game.scale.height, false, 'labels')

        this.player = new Player(
            /* scene */             this,
            /* speed */             1, 
            /* velocity */          new Phaser.Geom.Point(0, 0), 
            /* bounds */            this.gameMap.getBounds(), 
            /* graphicsObject */    this.add.graphics(), 
            /* body/shape */        new Phaser.GameObjects.Arc(this, 0, 0, 125).setFillStyle(0xfffff), 
        )
        

        for(let i = 0; i < 100; i++){
            this.testplayers.push(new Player(
                /* scene */             this,
                /* speed */             1, 
                /* velocity */          new Phaser.Geom.Point(0, 0), 
                /* bounds */            this.gameMap.getBounds(), 
                /* graphicsObject */    this.add.graphics(), 
                /* body/shape */        new Phaser.GameObjects.Arc(this, 
                                            Phaser.Math.Between(gameMapBounds[0], gameMapBounds[2]),
                                             Phaser.Math.Between(gameMapBounds[1], gameMapBounds[3]), Phaser.Math.Between(75, 150))
                                             .setFillStyle(0xf0fff0), 
            ))

        }

        let shape = this.player.getShape() // The secondary camera ignores the main player we control

        this.cameras.main.setBounds(
            gameMapBounds[0] - shape.radius, 
            gameMapBounds[1] - shape.radius, 
            gameMapBounds[2] - gameMapBounds[0] + shape.radius*2, 
            gameMapBounds[3] - gameMapBounds[1] + shape.radius*2
        )

        PlayerEvents.initAll(this.player)

        this.coordinatesInfo = this.add.text(50, 50, '').setFontSize(30)
        this.coordinatesInfo.setScrollFactor(0, 0)
        
        for(let i = 0; i < 100; i++){
            this.testplayers[i].draw()
        }
        
        this.cameras.main.startFollow(shape) // The main camera follows the player we control
        this.cameras.main.ignore(this.coordinatesInfo) // The main camera ignores texts
    }

    public update() : void 
    {
        for(let acceleration : number = 0; acceleration < 10; acceleration++){
            this.player.move()

            for(let i : number = 0; i < 100; i++){
                if(this.player.collidesWith(this.testplayers[i])){
                    this.player.getShape().x -= this.player.getVelocity().x * this.player.getSpeed()
                    this.player.getShape().y -= this.player.getVelocity().y * this.player.getSpeed()
                    this.player.getShape().radius -= 0.125

                    this.cameras.main.zoom = 125/this.player.getShape().radius
                }
            }

            this.player.draw()
            this.debug()
        }
    }

    private debug() : void 
    {
        this.coordinatesInfo.setText(`{x, y} => {${Math.floor(this.player.getShape().x)}, ${Math.floor(this.player.getShape().y)}}`)
    }
    
}