import { game } from "../game"
import { Arc } from "../../api/Arc";
import { Food } from "../../api/Food";
import { Explosion } from "../../api/Explosion";
import { BouncyWall } from "../../api/BouncyWall";
import { GameMap } from "../../api/GameMap";
import { PlayerEvents } from "../../api/PlayerEvents";

export class MainScene extends Phaser.Scene
{
    private player: Arc
    private gameMap: GameMap
    private testplayers: Arc[] = []
    private explosions: Arc[] = []
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
            /* speed */             5, 
            /* velocity */          new Phaser.Geom.Point(0, 0), 
            /* bounds */            gameMapBounds, 
            /* graphicsObject */    this.add.graphics(), 
            /* body/shape */        new Phaser.GameObjects.Arc(this, 0, 0, 64).setFillStyle(0xaffffa), 
        )
        this.testplayers.push(this.player)

        while(this.testplayers.length < 600){

            let randomNum: number = Phaser.Math.Between(0, 1)

            let randomRadius = randomNum ? Phaser.Math.Between(15, 35) : Phaser.Math.Between(30, 50)
            let randomColor = randomNum ? Phaser.Display.Color.GetColor(49, Phaser.Math.Between(95, 175), 50) :
                              Phaser.Display.Color.GetColor(Phaser.Math.Between(155, 255), 105, 36)
                              
            let randomX = Phaser.Math.Between(gameMapBounds[0] - randomRadius, gameMapBounds[2] + randomRadius)
            let randomY = Phaser.Math.Between(gameMapBounds[1] - randomRadius, gameMapBounds[3] + randomRadius)

            let newArc: Arc = randomNum ? new Food (this, 1, new Phaser.Geom.Point(0, 0), gameMapBounds, this.add.graphics(), 
                    new Phaser.GameObjects.Arc(this, randomX, randomY, randomRadius).setFillStyle(randomColor)) : 
                    new BouncyWall(this, 1, new Phaser.Geom.Point(0, 0), gameMapBounds, this.add.graphics(), 
                    new Phaser.GameObjects.Arc(this, randomX, randomY, randomRadius).setFillStyle(randomColor))    

            let collides: boolean = false

            for(let i = 0; i < this.testplayers.length; i++){
                let testplayer = this.testplayers[i]
                if(testplayer.collidesWith(newArc)){
                    collides = true
                    break
                }
            }

            if(!collides){
                this.testplayers.push(newArc)
            }
        }
        this.testplayers.splice(0, 1)
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
            this.testplayers[i].move()
            if(this.player.canSeeObject(this.testplayers[i])){
                if(this.player.collidesWith(this.testplayers[i])){
                    this.testplayers[i].actTowards(this.player)
                    
                    if(this.testplayers[i].getShape() == null){
                        this.testplayers.splice(i, 1)
                        continue
                    }
                } else {
                    this.testplayers[i].draw()
                }
            } else {
                this.testplayers[i].getGraphics().clear()
            }

            for(let k : number = 0; k < this.testplayers.length; k++){
                if(this.testplayers[i] === this.testplayers[k]){
                    continue
                }

                if(this.testplayers[i].collidesWith(this.testplayers[k])){

                    let shapes = [this.testplayers[i].getShape(), this.testplayers[k].getShape()]
                    let coords: Phaser.Math.Vector2[] = [shapes[0].getCenter(), shapes[1].getCenter()]
                    let radiuses: number[] = [shapes[0].radius, shapes[1].radius]

                    this.testplayers[i].destroy() 
                    this.testplayers[k].destroy()

                    let indCmp: boolean = i < k
                    this.testplayers.splice(i, 1)
                    indCmp ? this.testplayers.splice(k-1, 1) : this.testplayers.splice(k, 1)

                    let explosion: Arc = new Explosion(
                        /* scene */             this,
                        /* speed */             0, 
                        /* velocity */          new Phaser.Geom.Point(0, 0), 
                        /* bounds */            this.gameMap.getBounds(), 
                        /* graphicsObject */    this.add.graphics(), 
                        /* body/shape */        new Phaser.GameObjects.Arc(this, (coords[0].x + coords[1].x)/2, (coords[0].y + coords[1].y)/2, 10).setFillStyle(0xff0000), 
                        /* maximum radius */    Math.sqrt(radiuses[0]**2 + radiuses[1]**2)*3
                    )
                    this.explosions.push(explosion)
                    break
                }
            }
        }

        for(let i : number = 0; i < this.explosions.length; i++){
            if(this.explosions[i].getShape() == null){
                this.explosions.splice(i, 1)
                continue
            }
            for(let k : number = 0; k < this.testplayers.length; k++){
                if(this.explosions[i].collidesWith(this.testplayers[k])){
                    this.testplayers[i].destroy() 
                    this.testplayers[k].destroy()

                    let indCmp: boolean = i < k
                    this.testplayers.splice(i, 1)
                    indCmp ? this.testplayers.splice(k-1, 1) : this.testplayers.splice(k, 1)
                    break
                }
            }

        }
        this.player.draw()
    
        /*return shape.x + shape.radius >= cameraWorldView.x && shape.x - shape.radius <= cameraWorldView.x + cameraWorldView.width &&
            shape.y + shape.radius >= cameraWorldView.y && shape.y - shape.radius <= cameraWorldView.y + cameraWorldView.height */
        this.debug()
    }

    private debug() : void 
    {
        this.coordinatesInfo.setText( `{x, y, radius, camera} => {${Math.floor(this.player.getShape().x)}, ${Math.floor(this.player.getShape().y)},  ${Math.floor(this.player.getShape().radius)}}| ${this.cameras.main.zoom}, ${Math.floor(this.cameras.main.scrollX)}, ${Math.floor(this.cameras.main.scrollY)}`)
    }
    
}