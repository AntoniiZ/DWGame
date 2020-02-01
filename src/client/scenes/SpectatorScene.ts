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

        this.socket = socketio(`http://localhost:${config.default.server_port}/client`)
        let step = GameMap.settings.gridStep

        for (let x: number = -this.gameMapBounds[0] / 2 + step / 2; x < this.gameMapBounds[0] / 2 + step / 2; x += step) {
            for (let y: number = -this.gameMapBounds[1] / 2 + step / 2; y < this.gameMapBounds[1] / 2 + step / 2; y += step) {
                this.add.rectangle(x, y, step, step).setStrokeStyle(2, Phaser.Display.Color.GetColor(4, 85, 163), 0.8)
            }
        }

        this.cameras.main.setBounds(
            -this.gameMapBounds[0] / 2,
            -this.gameMapBounds[1] / 2,
            this.gameMapBounds[0],
            this.gameMapBounds[1]
        )

        this.spectator = new Player(
            this, this.add.graphics(), new Phaser.GameObjects.Arc(this, 0, 0, 2).setFillStyle(0xffffff), 20, this.getSocket().id
        )

        PlayerEvents.initAllSpectator(this.spectator, this.getSocket())
        this.cameras.main.startFollow(this.spectator.getShape(), true, 0.1, 0.1)
        
        this.add.text(window.innerWidth/3, 50, 'Spectator mode').setColor('#ffffff').setFontSize(50).setScrollFactor(0, 0)
    
        let ellipse = this.add.ellipse(window.innerWidth/2, window.innerHeight-50, 140, 60, 0x000fff).setInteractive().setScrollFactor(0, 0)
        ellipse.on('pointerdown', () => {
            this.getSocket().disconnect()
            this.scene.start('MainScene')
        })
        this.add.text(window.innerWidth/2-60, window.innerHeight-60, 'Play again').setColor('#ffffff').setFontSize(20).setScrollFactor(0, 0)
    }
    public update(): void {
        this.pseudoUpdate(this.spectator, this.getSocket())
    }
    public pseudoUpdate(spectator: Player, socket: SocketIOClient.Socket): void {
        spectator.move()
        for (let [otherPlayerSocketId, otherPlayer] of spectator.getOtherPlayers()) {
            //otherspectator.move()
            if (!spectator.canSeeObject(otherPlayer)) {
                otherPlayer.getGraphics().clear()
                continue
            }
            otherPlayer.draw()
        }

        let objects: Arc[] = spectator.getObjects()
        for (let i: number = 0; i < objects.length; i++) {
            if (objects[i] == null || objects[i].getShape() == null) {
                continue
            }
            //interpolation
            objects[i].move()
            spectator.updateObject(i, objects[i], socket)
            //spectator.updateObject(i, objects[i], socket)
            //interpolation
            if (spectator.canSeeObject(objects[i])) {
                objects[i].draw()
                continue
            }
            objects[i].getGraphics().clear()
        }
    }
}