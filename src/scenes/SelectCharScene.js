// src/scenes/SelectCharScene.js
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config/game.js';

export class SelectCharScene extends Phaser.Scene {
  constructor() { super('SelectCharScene'); }

  create({ playerId }) {
    const cx = GAME_W / 2;
    this.add.rectangle(cx, GAME_H / 2, GAME_W, GAME_H, 0x1a0a00);
    this.add.text(cx, 60, 'ESCOLHA SEU PERSONAGEM', { fontSize: '22px', fill: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5);

    // Character 1
    const c1 = this.add.sprite(cx - 150, 220, 'char1', 0).setScale(4).setInteractive({ useHandCursor: true });
    this.add.text(cx - 150, 300, 'CHAR 1', { fontSize: '16px', fill: '#FFF' }).setOrigin(0.5);

    // Character 2
    const c2 = this.add.sprite(cx + 150, 220, 'char2', 0).setScale(4).setInteractive({ useHandCursor: true });
    this.add.text(cx + 150, 300, 'CHAR 2', { fontSize: '16px', fill: '#FFF' }).setOrigin(0.5);

    [c1, c2].forEach((sprite, idx) => {
      sprite.on('pointerover', () => sprite.setTint(0xFFD700));
      sprite.on('pointerout',  () => sprite.clearTint());
      sprite.on('pointerdown', () => {
        this.scene.start('GameScene', { playerId, character: idx + 1, phase: 1 });
      });
    });

    this.add.text(cx, 400, '← VOLTAR', { fontSize: '16px', fill: '#888' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MenuScene', { playerId }));
  }
}
