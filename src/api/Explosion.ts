import { Arc } from './Arc';
import * as GameMap from './GameMapConfig'
import { Player } from './Player';
export class Explosion extends Arc {

    private player: Player
    private maximumRadius: number
    private explosionTimeout: number

    public constructor(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc, 
        maximumRadius: number, player: Player) {
        super(scene, graphics, shape)

        this.player = player
        this.maximumRadius = maximumRadius
        this.actTowards()
    }

    public move(): void { }

    public actTowards(): void {

        if (this.getShape().radius >= this.maximumRadius) {
            this.destroy()
            cancelAnimationFrame(this.explosionTimeout)
            return
        }

        this.explosionTimeout = requestAnimationFrame(() => {
            if(this.getShape() == null){
                return
            }
            let objects: Map<string, Arc> = this.player.getObjects()

            for (let [id, object] of objects) {
                if (object.collidesWith(this)) {
                    object.actTowards(this)
                    if(object.getShape() == null){
                        objects.delete(id)
                        if(this.player.getShape() != null){
                            this.player.destroyObject(id)
                        }
                    }
                }
            }

            this.getShape().radius += GameMap.settings.explosionRadiusAdjustmentValue
            this.draw()
            if(this.collidesWith(this.player) && this.player.getScene().scene.key == 'MainScene'){
                this.player.disconnect()
                this.player.getScene().scene.start('SpectatorScene')
            } else {
                this.actTowards()
            }
        })

    }

}