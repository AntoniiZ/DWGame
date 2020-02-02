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
            let objects: Arc[] = this.player.getObjects()

            for (let i = 0; i < objects.length; i++) {
                if (objects[i] == null || objects[i].getShape() == null) {
                    continue
                }
                if (!objects[i].canSeeObject(this) || !objects[i].collidesWith(this)) {
                    continue
                }
                objects[i].actTowards(this)
                this.player.destroyObject(i)

                ///handle Player death
            }

            this.getShape().radius += GameMap.settings.explosionRadiusAdjustmentValue
            if (this.player.canSeeObject(this)) {
                this.draw()
            }
            this.actTowards()
        })

    }

}