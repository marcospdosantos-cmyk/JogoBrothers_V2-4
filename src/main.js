// src/main.js
import './phaser-global.js'; // publishes global Phaser for rex plugins; keep first
import Phaser from 'phaser';
import { GAME_W, GAME_H } from './config/game.js';
import { BootScene } from './scenes/BootScene.js';
import { CadastroScene } from './scenes/CadastroScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { SelectCharScene } from './scenes/SelectCharScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { RankingScene } from './scenes/RankingScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#1a1018',
  pixelArt: true,             // crisp 16-bit scaling (no blur), implies roundPixels
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // Multi-touch: a platformer needs joystick + button pressed at the same time.
  input: { activePointers: 4 },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  dom: { createContainer: true },
  scene: [BootScene, CadastroScene, MenuScene, SelectCharScene, GameScene, GameOverScene, RankingScene],
});
