// src/scenes/MenuScene.js
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config/game.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create({ playerId }) {
    this._playerId = playerId;
    const cx = GAME_W / 2;

    // Background color — replace with background image when asset is ready
    this.add.rectangle(cx, GAME_H / 2, GAME_W, GAME_H, 0x1a0a00);

    this.add.text(cx, 100, 'BROTHERS BURGER', { fontSize: '36px', fill: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(cx, 145, 'O JOGO', { fontSize: '20px', fill: '#FFA500' }).setOrigin(0.5);

    const playerName = localStorage.getItem('bb_player_name') || '';
    this.add.text(cx, 200, `Olá, ${playerName}!`, { fontSize: '15px', fill: '#FFF' }).setOrigin(0.5);

    this._makeBtn(cx, 280, 'JOGAR', () => this.scene.start('SelectCharScene', { playerId }));
    this._makeBtn(cx, 340, 'RANKING', () => this.scene.start('RankingScene', { playerId }));
  }

  _makeBtn(x, y, label, cb) {
    const btn = this.add.text(x, y, `[ ${label} ]`, { fontSize: '24px', fill: '#FFD700', fontStyle: 'bold' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setFill('#FFF'));
    btn.on('pointerout',  () => btn.setFill('#FFD700'));
    btn.on('pointerdown', cb);
    return btn;
  }
}
