import 'phaser'
import {MainScene} from "./scenes/MainScene"

const config: Phaser.Types.Core.GameConfig = {

  type: Phaser.AUTO,
  parent: "gameContainer",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },

  physics: {
    default: 'ninja',
    arcade: {
        debug: false
    }
  },

  scene: [MainScene]
}

class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config)
  }
}

window.addEventListener("load", () => {
  const game = new Game(config)
})

export {Game, config}