import { game } from "../game"
import { Arc } from "../../api/Arc";
import { Food } from "../../api/Food";
import { Explosion } from "../../api/Explosion";
import { BouncyWall } from "../../api/BouncyWall";
import { PlayerEvents } from "../../api/PlayerEvents";
import * as GameMap from "../../api/GameMapConfig";
import { NetworkScene } from "./NetworkScene";
import { Player } from "../../api/Player";

export class MainScene extends NetworkScene
{
    private player: Player
    private gameMapBounds: number[] = GameMap.settings.size

    public constructor()
    {
        super("MainScene")
    }

    public create() : void
    {
        //this.gameMapBounds = GameMap.settings.size = [3000, 3000]

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
            -this.gameMapBounds[0]/2, 
            -this.gameMapBounds[1]/2, 
            this.gameMapBounds[0], 
            this.gameMapBounds[1]
        )

        this.cameras.main.startFollow(this.player.getShape(), true, 0.1, 0.1)
        
        PlayerEvents.initAll(this.player, this.getSocket())

        this.player.spawnPlayer(this.getSocket())
        this.player.updatePlayer(this.getSocket())
    }
    public update() : void
    {
        let copyCoords = new Phaser.Geom.Point(this.player.getShape().x, this.player.getShape().y)

        this.player.move()
        if(!(copyCoords.x == this.player.getShape().x && copyCoords.y == this.player.getShape().y)){
            this.player.updatePlayer(this.getSocket())
        }

        this.player.draw()
        for(let [otherPlayerSocketId, otherPlayer] of this.player.getOtherPlayers())
        {
            if(this.player.canSeeObject(otherPlayer))
            {
                if(this.player.collidesWith(otherPlayer)){
                    otherPlayer.actTowards(this.player)
                    this.player.updatePlayer(this.getSocket())
                }
                otherPlayer.draw()
            }
        }
        for(let arc of this.player.getObjects())
        {
            if(this.player.canSeeObject(arc))
            {
                arc.draw()
            }
        }
    }

    
}