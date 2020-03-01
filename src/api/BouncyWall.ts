import { Arc } from "./Arc";
import { Player } from "./Player";
import * as GameMap from "./GameMapConfig"
import { Explosion } from "./Explosion";
import { game } from "../client/game";

export class BouncyWall extends Arc {

    public constructor(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics, shape: Phaser.GameObjects.Arc,
        speed?: number, velocity?: Phaser.Geom.Point) {
            
        super(scene, graphics, shape, speed, velocity)
    }

    public move(): void {

        let bounds: number[] = GameMap.settings.size

        this.getShape().x += this.getVelocity().x * this.getSpeed() * game.loop.targetFps / game.loop.actualFps 
        this.getShape().y += this.getVelocity().y * this.getSpeed() * game.loop.targetFps / game.loop.actualFps 

        if (this.getShape().x <= -bounds[0] / 2 + this.getShape().radius) {
            this.getShape().x = -bounds[0] / 2 + this.getShape().radius
            this.setVelocity(-this.getVelocity().x, this.getVelocity().y)
        }
        else if (this.getShape().x >= bounds[0] / 2 - this.getShape().radius) {
            this.getShape().x = bounds[0] / 2 - this.getShape().radius
            this.setVelocity(-this.getVelocity().x, this.getVelocity().y)
        }

        if (this.getShape().y <= -bounds[1] / 2 + this.getShape().radius) {
            this.getShape().y = -bounds[1] / 2 + this.getShape().radius
            this.setVelocity(this.getVelocity().x, -this.getVelocity().y)

        }
        else if (this.getShape().y >= bounds[1] / 2 - this.getShape().radius) {
            this.getShape().y = bounds[1] / 2 - this.getShape().radius
            this.setVelocity(this.getVelocity().x, -this.getVelocity().y)
        }

    }

    public actTowards(arc?: Arc, player?: Player): void {

        if ((arc instanceof Explosion)) {
            this.destroy()
            return
        }
        
        if (!(arc instanceof BouncyWall)) {
            return
        }
        if ((arc instanceof Player)) {
            this.setSpeed(arc.getSpeed() / (this.getShape().radius / arc.getShape().radius))
            this.setVelocity(arc.getVelocity().x, arc.getVelocity().y)

            arc.getShape().x -= arc.getVelocity().x * arc.getSpeed() * 2 * game.loop.targetFps / game.loop.actualFps 
            arc.getShape().y -= arc.getVelocity().y * arc.getSpeed() * 2 * game.loop.targetFps / game.loop.actualFps 

            if (arc.getShape().radius > GameMap.settings.playerMinRadius) {
                arc.getShape().radius /= GameMap.settings.playerWallRadiusReductionCoef
                this.getScene().cameras.main.zoom *= (Math.sqrt(GameMap.settings.playerWallRadiusReductionCoef))
            }
            return
        }
        
        let explosion = new Explosion(
            this.getScene(), 
            this.getScene().add.graphics(), 
            new Phaser.GameObjects.Arc(
                this.getScene(), 
                (arc.getShape().x + this.getShape().x) / 2,
                (arc.getShape().y + this.getShape().y) / 2,
                GameMap.settings.explosionInitialRadius
            ).setFillStyle(GameMap.settings.explosionColorRange),
            (arc.getShape().radius + this.getShape().radius)*3,
            player
        )
        player.getSocket().emit('createExplosion', {
            x: explosion.getShape().x,
            y: explosion.getShape().y,
            radius: explosion.getShape().radius,
            maximumRadius: (arc.getShape().radius + this.getShape().radius)*3
        })

        this.destroy()
        arc.destroy()

    }

}
