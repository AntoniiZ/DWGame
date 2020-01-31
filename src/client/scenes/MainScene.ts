import { game } from "../game"
import { Arc } from "../../api/Arc";
import { Food } from "../../api/Food";
import { Explosion } from "../../api/Explosion";
import { BouncyWall } from "../../api/BouncyWall";
import { PlayerEvents } from "../../api/PlayerEvents";
import * as GameMap from "../../api/GameMapConfig";
import { NetworkScene } from "./NetworkScene";
import { Player } from "../../api/Player";

export class MainScene extends NetworkScene {
    private player: Player
    private gameMapBounds: number[] = GameMap.settings.size

    public constructor() {
        super("MainScene")
    }
    public preload(): void {
        //this.load.image('background', '../assets/Map1.jpg')
    }

    public create(): void {

        let step = GameMap.settings.gridStep

        for(let x: number = -this.gameMapBounds[0]/2 + step/2; x < this.gameMapBounds[0]/2 + step/2; x += step){
            for(let y: number = -this.gameMapBounds[1]/2 + step/2; y < this.gameMapBounds[1]/2 + step/2; y += step){
                this.add.rectangle(x, y, step, step).setStrokeStyle(2, Phaser.Display.Color.GetColor(4, 85, 163), 0.8)
            }
        }
        //this.gameMapBounds = GameMap.settings.size = [3000, 3000]
        /*this.add.image(-GameMap.settings.size[0]/2, -GameMap.settings.size[1]/2, 'background').setOrigin(0, 0)
            .setDisplaySize(GameMap.settings.size[0], GameMap.settings.size[1])*/

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

        this.cameras.main.setBounds(
            -this.gameMapBounds[0] / 2,
            -this.gameMapBounds[1] / 2,
            this.gameMapBounds[0],
            this.gameMapBounds[1]
        )

        this.cameras.main.startFollow(this.player.getShape(), true, 0.1, 0.1)

        PlayerEvents.initAll(this.player, this.getSocket())

        this.player.spawnPlayer(this.getSocket())
        this.player.updatePlayer(this.getSocket())
    }
    public update(): void {
        //console.log(this.game.loop.actualFps) ~LAST_CHECKED_GOOD

        this.player.move()
        this.player.updatePlayer(this.getSocket())
        this.player.draw()
        
        for (let [otherPlayerSocketId, otherPlayer] of this.player.getOtherPlayers()) {
            //otherPlayer.move()
            if (!this.player.canSeeObject(otherPlayer)) {
                otherPlayer.getGraphics().clear()
                continue
            }
            if (this.player.collidesWith(otherPlayer)) {
                this.player.setVelocity(0, 0)
                this.player.updatePlayer(this.getSocket())
            } 
            otherPlayer.draw()
        }

        let objects: Arc[] = this.player.getObjects()
        for (let i: number = 0; i < objects.length; i++) {
            if(objects[i].getShape() == null){
                continue
            }
            if (this.player.canSeeObject(objects[i])) {
                objects[i].draw()
                if(!this.player.collidesWith(objects[i])){
                    continue
                }
                objects[i].actTowards(this.player)
                this.player.updatePlayer(this.getSocket())
                if(objects[i].getShape() != null){
                    this.player.updateObject(i, objects[i], this.getSocket())
                }
                continue
            } 
            objects[i].getGraphics().clear()
        }
    }
}