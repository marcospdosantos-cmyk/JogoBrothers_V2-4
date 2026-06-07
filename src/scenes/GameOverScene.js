// src/scenes/GameOverScene.js
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config/game.js';
import { RankingService } from '../services/RankingService.js';

export class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  init(data) {
    this._playerId  = data.playerId || localStorage.getItem('bb_player_id');
    this._score     = data.score || 0;
    this._win       = data.win || false;
    this._character = data.character || 1;
  }

  async create() {
    // Dark overlay
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.85);

    // Title
    const titleText = this._win ? '🏆 VITÓRIA!' : 'GAME OVER';
    const titleColor = this._win ? '#ffdd00' : '#ff4444';
    this.add.text(GAME_W / 2, 80, titleText, {
      fontSize: '36px', fill: titleColor, fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    // Player name
    const name = localStorage.getItem('bb_player_name') || 'Jogador';
    this.add.text(GAME_W / 2, 130, `Parabéns, ${name}!`, {
      fontSize: '16px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Score
    this.add.text(GAME_W / 2, 170, `PONTUAÇÃO`, {
      fontSize: '12px', fill: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0.5);
    this.add.text(GAME_W / 2, 195, String(this._score), {
      fontSize: '32px', fill: '#ffffff', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    // Save score to Supabase
    if (this._playerId && this._score > 0) {
      try {
        const svc = new RankingService();
        await svc.saveScore(this._playerId, this._score, this._character);
      } catch (_) { /* non-fatal */ }
    }

    // Buttons
    this._addButton(GAME_W / 2, 270, 'JOGAR NOVAMENTE', () => {
      this.scene.start('SelectCharScene');
    });
    this._addButton(GAME_W / 2, 320, 'VER RANKING', () => {
      this.scene.start('RankingScene');
    });
    this._addButton(GAME_W / 2, 370, 'MENU', () => {
      this.scene.start('MenuScene');
    });
  }

  _addButton(x, y, label, onClick) {
    const bg = this.add.rectangle(x, y, 220, 36, 0x333333).setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, {
      fontSize: '14px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);
    bg.on('pointerover',  () => bg.setFillStyle(0x555555));
    bg.on('pointerout',   () => bg.setFillStyle(0x333333));
    bg.on('pointerdown',  onClick);
    return { bg, txt };
  }
}
