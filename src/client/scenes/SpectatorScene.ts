import { game } from "../game"
import { Arc } from "../../api/Arc";
import { Food } from "../../api/Food";
import { Explosion } from "../../api/Explosion";
import { BouncyWall } from "../../api/BouncyWall";
import { PlayerEvents } from "../../api/PlayerEvents";
import * as GameMap from "../../api/GameMapConfig";
import { NetworkScene } from "./NetworkScene";
import { Player } from "../../api/Player";
import * as config from '../../server/config'
import * as socketio from 'socket.io-client'

export class SpectatorScene extends Phaser.Scene {

    private spectator: Player
    private socket: SocketIOClient.Socket
    private gameMapBounds: number[] = GameMap.settings.size

    public constructor() {
        super('SpectatorScene')
    }

    public getSocket(): SocketIOClient.Socket {
        return this.socket
    }

    public create(): void {
        let playerUsername: string = document.getElementById('username').innerHTML
        this.cameras.add(0, 0, window.innerWidth, window.innerHeight).setName('staticCamera')

        this.socket = socketio(`http://${config.default.server_ip}:${config.default.server_port}/client`)
        let step = GameMap.settings.gridStep

        for (let x: number = -this.gameMapBounds[0] / 2 + step / 2; x < this.gameMapBounds[0] / 2 + step / 2; x += step) {
            for (let y: number = -this.gameMapBounds[1] / 2 + step / 2; y < this.gameMapBounds[1] / 2 + step / 2; y += step) {
                this.add.rectangle(x, y, step, step).setStrokeStyle(2, Phaser.Display.Color.GetColor(4, 85, 163), 0.8)
                .cameraFilter = this.cameras.getCamera('staticCamera').id
            }
        }

        this.cameras.main.setBounds(
            -this.gameMapBounds[0] / 2,
            -this.gameMapBounds[1] / 2,
            this.gameMapBounds[0],
            this.gameMapBounds[1]
        )

        this.spectator = new Player(
            this.getSocket(), playerUsername, this, this.add.graphics(), 
            new Phaser.GameObjects.Arc(this, 0, 0, 2).setFillStyle(0xffffff), 20
        )

        PlayerEvents.initAllSpectator(this.spectator)
        this.cameras.main.startFollow(this.spectator.getShape(), true, 0.1, 0.1)

        this.add.text(window.innerWidth/2, 50, 'Spectator').setFontSize(50).setColor('#ffffff')
        .setScrollFactor(0, 0).setOrigin(0.5).cameraFilter = this.cameras.main.id

    }
    public update(): void {
        this.pseudoUpdate(this.spectator)
    }
    public pseudoUpdate(player: Player): void {

        player.move()
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
                objects.delete(id)
            } else {
                object.move()
                if (player.canSeeObject(object)) {
                    object.draw()
                } else {
                    object.getGraphics().clear()
                }
            }
        }

        for (let [id1, object1] of objects) {
            if (object1.getShape() == null) {
                objects.delete(id1)
            } else {
                for (let [id2, object2] of objects) {
                    if (object1.getShape() == null) {
                        objects.delete(id1)
                        break
                    }
                    if(object1 == object2){
                        continue
                    }
                    if (object2.getShape() == null) {
                        objects.delete(id2)
                    } else {
                        if (object2.collidesWith(object1)) {
                            object2.actTowards(object1, player)
                        }
                    }
                }
            }
        }
    }
}
