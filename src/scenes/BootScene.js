// src/scenes/BootScene.js
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    // ⚠️ Replace file paths with actual designer assets when available.
    this.load.image('logo', 'assets/sprites/ui.png');
    this.load.spritesheet('char1', 'assets/sprites/char1.png', { frameWidth: 16, frameHeight: 24 });
    this.load.spritesheet('char2', 'assets/sprites/char2.png', { frameWidth: 16, frameHeight: 24 });
    this.load.spritesheet('enemies', 'assets/sprites/enemies.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('bosses', 'assets/sprites/bosses.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('powerups', 'assets/sprites/powerups.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('collectibles', 'assets/sprites/collectibles.png', { frameWidth: 16, frameHeight: 16 });
    this.load.tilemapTiledJSON('fase1', 'assets/tilemaps/fase1.json');
    this.load.tilemapTiledJSON('fase2', 'assets/tilemaps/fase2.json');
    this.load.tilemapTiledJSON('fase3', 'assets/tilemaps/fase3.json');
    this.load.tilemapTiledJSON('fase4', 'assets/tilemaps/fase4.json');
    this.load.image('cozinha', 'assets/tilesets/cozinha.png');
    this.load.image('rua', 'assets/tilesets/rua.png');
    this.load.image('mercado', 'assets/tilesets/mercado.png');
    this.load.image('restaurante', 'assets/tilesets/restaurante.png');
    this.load.audio('fase1', 'assets/audio/fase1.mp3');
    this.load.audio('fase2', 'assets/audio/fase2.mp3');
    this.load.audio('fase3', 'assets/audio/fase3.mp3');
    this.load.audio('fase4', 'assets/audio/fase4.mp3');
    this.load.audio('boss', 'assets/audio/boss.mp3');
    this.load.audio('sfx_jump', 'assets/audio/sfx/jump.mp3');
    this.load.audio('sfx_collect', 'assets/audio/sfx/collect.mp3');
    this.load.audio('sfx_powerup', 'assets/audio/sfx/powerup.mp3');
    this.load.audio('sfx_damage', 'assets/audio/sfx/damage.mp3');
    this.load.audio('sfx_defeat', 'assets/audio/sfx/defeat.mp3');
  }

  create() {
    const playerId = localStorage.getItem('bb_player_id');
    if (playerId) {
      this.scene.start('MenuScene', { playerId });
    } else {
      this.scene.start('CadastroScene');
    }
  }
}
