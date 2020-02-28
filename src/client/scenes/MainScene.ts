import { Arc } from "../../api/Arc";
import { PlayerEvents } from "../../api/PlayerEvents";
import * as GameMap from "../../api/GameMapConfig";
import { NetworkScene } from "./NetworkScene";
import { Player } from "../../api/Player";

export class MainScene extends NetworkScene {

    private player: Player
    private coords: Phaser.GameObjects.Text
    private leaderboardPlayerCount: number = 10
    private lbPlayers: Phaser.GameObjects.Text[] = []
    private gameMapBounds: number[] = GameMap.settings.size

    public constructor() {
        super("MainScene")
    }

    public create(): void {
        let playerUsername: string = document.getElementById('username').innerHTML
        this.cameras.add(0, 0, window.innerWidth, window.innerHeight).setName('staticCamera')

        let step = GameMap.settings.gridStep

        for (let x: number = -this.gameMapBounds[0] / 2 + step / 2; x < this.gameMapBounds[0] / 2 + step / 2; x += step) {
            for (let y: number = -this.gameMapBounds[1] / 2 + step / 2; y < this.gameMapBounds[1] / 2 + step / 2; y += step) {
                this.add.rectangle(x, y, step, step).setStrokeStyle(2, Phaser.Display.Color.GetColor(4, 85, 163), 0.8)
                .cameraFilter = this.cameras.getCamera('staticCamera').id
            }
        }
        let randomPlayerColor = [
            GameMap.settings.playerColorRange[0][0] + Math.random() * (GameMap.settings.playerColorRange[0][1] - GameMap.settings.playerColorRange[0][0]),
            GameMap.settings.playerColorRange[1][0] + Math.random() * (GameMap.settings.playerColorRange[1][1] - GameMap.settings.playerColorRange[1][0]),
            GameMap.settings.playerColorRange[2][0] + Math.random() * (GameMap.settings.playerColorRange[2][1] - GameMap.settings.playerColorRange[2][0])
        ]
        this.player = new Player(
            this.getSocket(),
            playerUsername,
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
            ).setFillStyle(Phaser.Display.Color.GetColor(randomPlayerColor[0], randomPlayerColor[1], randomPlayerColor[2])),
            GameMap.settings.playerSpeed
        )

        this.cameras.main.setBounds(
            -this.gameMapBounds[0] / 2,
            -this.gameMapBounds[1] / 2,
            this.gameMapBounds[0],
            this.gameMapBounds[1]
        )

        this.cameras.main.startFollow(this.player.getShape(), true, 0.1, 0.1)

        PlayerEvents.initAll(this.player)

        this.player.spawnPlayer()
        this.player.updatePlayer()

        this.coords = this.add.text(50, 50, '').setFontSize(25).setColor("#ffffff").setScrollFactor(0, 0)
        this.coords.cameraFilter = this.cameras.main.id

        for(let i: number = 0; i < this.leaderboardPlayerCount; i++){
            this.lbPlayers[i] = this.add.text(window.innerWidth/2, 20 + 40*i, '').setFontSize(35).setScrollFactor(0, 0)
            this.lbPlayers[i].cameraFilter = this.cameras.main.id
        }

    }
    public updateLeaderboard(): void {
        let sortedPlayers: Player[] = []
        sortedPlayers.push(this.player)
        for(let [id, otherPlayer] of this.player.getOtherPlayers()){
            sortedPlayers.push(otherPlayer)
        }
        for(let i: number = 0; i < this.leaderboardPlayerCount; i++){
            this.lbPlayers[i].setText('')
        }
        sortedPlayers.sort((a: Player, b: Player) => {
            let ar: number = a.getShape().radius, br: number = b.getShape().radius

            if(ar == br){
                return ar > br ? -1 : ar < br ? 1 : 0;
            }
            
            return ar > br ? -1 : 1;
        })

        let loopEnd: number = (this.player.getOtherPlayers().size+1 < this.leaderboardPlayerCount) ?
            this.player.getOtherPlayers().size+1 : this.leaderboardPlayerCount

        for(let i: number = 0; i < loopEnd; i++){
            (sortedPlayers[i].getSocket()) ? this.lbPlayers[i].setColor("#ffd700") : this.lbPlayers[i].setColor('#ffffff')
            
            this.lbPlayers[i].setText(`${i+1} => ${sortedPlayers[i].getUsername()} | ${Math.floor(sortedPlayers[i].getShape().radius)}`)
        }
    }
    public update(): void {
        this.updateLeaderboard()
        this.pseudoUpdate(this.player)
    }
    public pseudoUpdate(player: Player): void {
        //console.log(this.game.loop.actualFps) ~LAST_CHECKED_GOOD
        this.coords.setText(`{x, y} => {${Math.floor(player.getShape().x)}, ${Math.floor(player.getShape().y)}}`)

        player.move()
        player.updatePlayer()
        player.draw()

        for (let [otherPlayerSocketId, otherPlayer] of player.getOtherPlayers()) {
            if (!player.canSeeObject(otherPlayer)) {
                otherPlayer.getGraphics().clear()
                continue
            }
            otherPlayer.draw()
        }

        let objects: Map<string, Arc> = player.getObjects()
        for (let [id, object] of objects) {
            if (object.getShape() == null) {
                player.destroyObject(id)
                objects.delete(id)
            } else {
                object.move()
                if (player.canSeeObject(object)) {
                    object.draw()
                    if (player.collidesWith(object)) {
                        object.actTowards(player)
                        player.updatePlayer()
                        if (object.getShape() != null) {
                            player.updateObject(id, object)
                        } else {
                            object.getGraphics().clear()
                        }
                    }
                } else {
                    object.getGraphics().clear()
                }
            }
        }

        for (let [id1, object1] of objects) {
            if (object1.getShape() == null) {
                player.destroyObject(id1)
                objects.delete(id1)
            } else {
                for (let [id2, object2] of objects) {
                    if (object1.getShape() == null) {
                        player.destroyObject(id1)
                        objects.delete(id1)
                        break
                    }
                    if(object1 == object2){
                        continue
                    }

                    if (object2.getShape() == null) {
                        player.destroyObject(id2)
                        objects.delete(id2)
                    } else {
                        if (object2.collidesWith(object1)) {

                            object2.actTowards(object1, player)

                            if (object2.getShape() != null) {
                                player.updateObject(id2, object2)
                            }

                            if (object1.getShape() != null) {
                                player.updateObject(id1, object1)
                            }
                        }
                    }
                }
            }
        }
    }
}