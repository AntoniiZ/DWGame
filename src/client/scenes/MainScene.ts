import { game } from "../game"
import { Arc } from "../../api/Arc";
import { Food } from "../../api/Food";
import { Explosion } from "../../api/Explosion";
import { BouncyWall } from "../../api/BouncyWall";
import { PlayerEvents } from "../../api/PlayerEvents";
import * as GameMap from "../../api/GameMapConfig";
import { NetworkScene } from "./NetworkScene";
import { Player } from "../../api/Player";
import 'babel-polyfill'
export class MainScene extends NetworkScene
{
    private player: Player
    private explosions: Arc[] = []
    private testplayers: Arc[] = []
    private players: Promise<Map<string, Player>>
    private gameMapBounds: number[] = GameMap.settings.size

    public constructor()
    {
        super("MainScene")
    }

    public create() : void
    {
        
        this.player = new Player(
            this, 
            this.add.graphics(), 
            new Phaser.GameObjects.Arc(
                this, 
                Phaser.Math.Between(
                    GameMap.settings.playerSpawnCoordsRange[0], 
                    GameMap.settings.playerSpawnCoordsRange[1]
                ), 
                Phaser.Math.Between(
                    GameMap.settings.playerSpawnCoordsRange[0], 
                    GameMap.settings.playerSpawnCoordsRange[1]
                ), 
                GameMap.settings.playerRadius
            ).setFillStyle(GameMap.settings.playerColor), 
            GameMap.settings.playerSpeed,
            this.getSocket().id
        )
        PlayerEvents.initAll(this.player)

        this.players = PlayerEvents.getConnectedPlayers(this.getSocket())
        this.players.then((value: Map<string, Player>) => {
            console.error(value)
        })

        this.player.spawnPlayer(this.getSocket())

        /// THIS PART SHOULD BE IN SERVER, TO DO
        while(this.testplayers.length < GameMap.settings.amountOfRandomObjects){

            let randomNum: number = Phaser.Math.Between(0, 1)

            let randomRadius = randomNum ? 
                Phaser.Math.Between(GameMap.settings.foodRadiusRange[0], GameMap.settings.foodRadiusRange[1]) : 
                Phaser.Math.Between(GameMap.settings.wallsRadiusRange[0], GameMap.settings.wallsRadiusRange[1])

            let randomColor = randomNum ? 
                Phaser.Display.Color.GetColor(
                    Phaser.Math.Between(GameMap.settings.foodColorRange[0][0], GameMap.settings.foodColorRange[0][1]),
                    Phaser.Math.Between(GameMap.settings.foodColorRange[1][0], GameMap.settings.foodColorRange[1][1]),
                    Phaser.Math.Between(GameMap.settings.foodColorRange[2][0], GameMap.settings.foodColorRange[2][1])
                ) : 
                Phaser.Display.Color.GetColor(
                    Phaser.Math.Between(GameMap.settings.wallsColorRange[0][0], GameMap.settings.wallsColorRange[0][1]),
                    Phaser.Math.Between(GameMap.settings.wallsColorRange[1][0], GameMap.settings.wallsColorRange[1][1]),
                    Phaser.Math.Between(GameMap.settings.wallsColorRange[2][0], GameMap.settings.wallsColorRange[2][1])
                )

            let randomX = Phaser.Math.Between(-this.gameMapBounds[0]/2 + randomRadius, this.gameMapBounds[0]/2 - randomRadius)
            let randomY = Phaser.Math.Between(-this.gameMapBounds[1]/2 + randomRadius, this.gameMapBounds[1]/2 - randomRadius)

            let newArc: Arc = randomNum ? 
                new Food(
                    this, 
                    this.add.graphics(), 
                    new Phaser.GameObjects.Arc(this, randomX, randomY, randomRadius).setFillStyle(randomColor)
                ) :
                new BouncyWall(
                    this, 
                    this.add.graphics(), 
                    new Phaser.GameObjects.Arc(this, randomX, randomY, randomRadius).setFillStyle(randomColor)
                ) 

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
        //////

        this.cameras.main.setBounds(
            -this.gameMapBounds[0]/2, 
            -this.gameMapBounds[1]/2, 
            this.gameMapBounds[0], 
            this.gameMapBounds[1]
        )

        this.cameras.main.startFollow(this.player.getShape(), true, 0.1, 0.1) // The main camera follows the player we control
    }

    public update() : void 
    {
        let copyCoords = new Phaser.Geom.Point(this.player.getShape().x, this.player.getShape().y)

        this.player.move()
        if(!(copyCoords.x == this.player.getShape().x && copyCoords.y == this.player.getShape().y)){
            this.player.updatePlayer(this.getSocket())
        }

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
                        this, 
                        this.add.graphics(), 
                        new Phaser.GameObjects.Arc(
                            this, 
                            (coords[0].x + coords[1].x)/2, 
                            (coords[0].y + coords[1].y)/2, 
                            GameMap.settings.explosionInitialRadius
                        ).setFillStyle(GameMap.settings.explosionColorRange), 
                        Math.sqrt(radiuses[0]**2 + radiuses[1]**2)*3
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
    }
    
}