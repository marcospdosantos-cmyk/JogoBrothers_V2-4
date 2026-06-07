// src/scenes/RankingScene.js
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config/game.js';
import { RankingService } from '../services/RankingService.js';

export class RankingScene extends Phaser.Scene {
  constructor() { super({ key: 'RankingScene' }); }

  async create() {
    const playerId = localStorage.getItem('bb_player_id');

    // Background
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x111111);

    // Title
    this.add.text(GAME_W / 2, 24, 'RANKING DO MÊS', {
      fontSize: '22px', fill: '#ffdd00', fontFamily: 'monospace',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    // Loading indicator
    const loadingTxt = this.add.text(GAME_W / 2, GAME_H / 2, 'Carregando...', {
      fontSize: '14px', fill: '#888888', fontFamily: 'monospace'
    }).setOrigin(0.5);

    let topTen = [];
    let playerRank = null;
    try {
      const svc = new RankingService();
      [topTen, playerRank] = await Promise.all([
        svc.getTopTen(),
        playerId ? svc.getPlayerRank(playerId) : Promise.resolve(null)
      ]);
    } catch (_) { /* show empty ranking */ }

    loadingTxt.destroy();

    // Table header
    const headerY = 60;
    this.add.text(60,           headerY, '#',        { fontSize: '12px', fill: '#aaaaaa', fontFamily: 'monospace' });
    this.add.text(90,           headerY, 'NOME',     { fontSize: '12px', fill: '#aaaaaa', fontFamily: 'monospace' });
    this.add.text(GAME_W - 80,  headerY, 'PONTOS',   { fontSize: '12px', fill: '#aaaaaa', fontFamily: 'monospace' });

    // Rows
    const playerName = localStorage.getItem('bb_player_name') || '';
    topTen.forEach(({ name, score }, i) => {
      const rowY = 78 + i * 28;
      const isPlayer = playerName && name.toLowerCase().startsWith(playerName.toLowerCase());
      const color = i === 0 ? '#ffdd00' : isPlayer ? '#aaffaa' : '#ffffff';
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      this.add.text(60,           rowY, medal,             { fontSize: '13px', fill: color, fontFamily: 'monospace' });
      this.add.text(90,           rowY, name,              { fontSize: '13px', fill: color, fontFamily: 'monospace' });
      this.add.text(GAME_W - 80,  rowY, String(score),     { fontSize: '13px', fill: color, fontFamily: 'monospace' });
    });

    if (topTen.length === 0) {
      this.add.text(GAME_W / 2, 160, 'Nenhuma pontuação ainda.', {
        fontSize: '14px', fill: '#888888', fontFamily: 'monospace'
      }).setOrigin(0.5);
    }

    // Player's rank (if not in top 10)
    if (playerRank && playerRank > 10) {
      this.add.text(GAME_W / 2, GAME_H - 80, `Sua posição: #${playerRank}`, {
        fontSize: '14px', fill: '#aaffaa', fontFamily: 'monospace'
      }).setOrigin(0.5);
    }

    // Back button
    const bg = this.add.rectangle(GAME_W / 2, GAME_H - 36, 180, 32, 0x333333).setInteractive({ useHandCursor: true });
    const txt = this.add.text(GAME_W / 2, GAME_H - 36, 'VOLTAR', {
      fontSize: '14px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x555555));
    bg.on('pointerout',  () => bg.setFillStyle(0x333333));
    bg.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
