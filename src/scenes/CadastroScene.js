// src/scenes/CadastroScene.js
import Phaser from 'phaser';
import { PlayerService } from '../services/PlayerService.js';
import { GAME_W, GAME_H } from '../config/game.js';

export class CadastroScene extends Phaser.Scene {
  constructor() { super('CadastroScene'); }

  create() {
    const svc = new PlayerService();
    const cx = GAME_W / 2;

    this.add.text(cx, 60, 'BROTHERS BURGER', { fontSize: '28px', fill: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(cx, 100, 'Cadastre-se para jogar!', { fontSize: '16px', fill: '#FFF' }).setOrigin(0.5);

    const style = 'width:220px;padding:8px;font-size:16px;background:#222;color:#fff;border:2px solid #FFD700;border-radius:6px;';
    const nomeEl      = this.add.dom(cx, 170).createElement('input').setAttr('placeholder', 'Nome').setAttr('style', style);
    const sobrenomeEl = this.add.dom(cx, 220).createElement('input').setAttr('placeholder', 'Sobrenome').setAttr('style', style);
    const telEl       = this.add.dom(cx, 270).createElement('input').setAttr('placeholder', 'Telefone (11999999999)').setAttr('style', style).setAttr('type', 'tel');

    const errText = this.add.text(cx, 310, '', { fontSize: '13px', fill: '#FF4444' }).setOrigin(0.5);

    const btn = this.add.text(cx, 350, '[ JOGAR ]', { fontSize: '22px', fill: '#FFD700', fontStyle: 'bold' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', async () => {
      const nome      = nomeEl.node.value.trim();
      const sobrenome = sobrenomeEl.node.value.trim();
      const telefone  = telEl.node.value.trim().replace(/\D/g, '');

      if (!nome || !sobrenome) { errText.setText('Preencha nome e sobrenome.'); return; }
      if (telefone.length < 10) { errText.setText('Telefone inválido.'); return; }

      btn.setText('Aguarde...').setInteractive(false);
      try {
        const player = await svc.create(nome, sobrenome, telefone);
        localStorage.setItem('bb_player_id', player.id);
        localStorage.setItem('bb_player_name', `${player.nome} ${player.sobrenome}`);
        this.scene.start('MenuScene', { playerId: player.id });
      } catch (e) {
        errText.setText('Erro ao cadastrar. Tente novamente.');
        btn.setText('[ JOGAR ]').setInteractive(true);
      }
    });
  }
}
