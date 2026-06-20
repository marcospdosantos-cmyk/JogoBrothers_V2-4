import Phaser from 'phaser';
import { PlayerService } from '../services/PlayerService.js';
import { supabaseConfigured } from '../config/supabase.js';

function localId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'local-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
}

// Native HTML overlay for registration. Far more reliable on mobile than Phaser's
// DOM layer (real inputs, native keyboard, no canvas-scale transforms).
export class CadastroScene extends Phaser.Scene {
  constructor() { super('CadastroScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#1a1018');
    this._svc = new PlayerService();
    this._buildOverlay();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this._cleanup());
  }

  _buildOverlay() {
    const wrap = document.createElement('div');
    wrap.id = 'cadastro-overlay';
    wrap.innerHTML = `
      <div class="bb-card">
        <h1 class="bb-title">BROTHERS BURGER</h1>
        <p class="bb-sub">Cadastre-se para jogar!</p>
        <input class="bb-input" id="bb-nome" type="text" inputmode="text"
               autocomplete="given-name" placeholder="Nome" maxlength="40" />
        <input class="bb-input" id="bb-sobrenome" type="text" inputmode="text"
               autocomplete="family-name" placeholder="Sobrenome" maxlength="40" />
        <input class="bb-input" id="bb-tel" type="tel" inputmode="numeric"
               autocomplete="tel" placeholder="Telefone (DDD + número)" maxlength="15" />
        <p class="bb-err" id="bb-err"></p>
        <button class="bb-btn" id="bb-go">JOGAR</button>
      </div>`;
    this._injectStyles();
    document.body.appendChild(wrap);
    this._overlay = wrap;

    const nomeEl = wrap.querySelector('#bb-nome');
    const sobrenomeEl = wrap.querySelector('#bb-sobrenome');
    const telEl = wrap.querySelector('#bb-tel');
    const errEl = wrap.querySelector('#bb-err');
    const btn = wrap.querySelector('#bb-go');

    const submit = async () => {
      const nome = nomeEl.value.trim();
      const sobrenome = sobrenomeEl.value.trim();
      const telefone = telEl.value.replace(/\D/g, '');

      if (!nome || !sobrenome) { errEl.textContent = 'Preencha nome e sobrenome.'; return; }
      if (telefone.length < 10) { errEl.textContent = 'Telefone inválido (com DDD).'; return; }

      errEl.textContent = '';
      btn.disabled = true;
      btn.textContent = 'Aguarde...';

      let playerId;
      try {
        if (!supabaseConfigured) throw new Error('offline');
        const player = await this._svc.create(nome, sobrenome, telefone);
        playerId = player.id;
      } catch (e) {
        playerId = localId();
      }

      localStorage.setItem('bb_player_id', playerId);
      localStorage.setItem('bb_player_name', `${nome} ${sobrenome}`);
      this._cleanup();
      this.scene.start('MenuScene', { playerId });
    };

    btn.addEventListener('click', submit);
    telEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  }

  _injectStyles() {
    if (document.getElementById('bb-cadastro-styles')) return;
    const style = document.createElement('style');
    style.id = 'bb-cadastro-styles';
    style.textContent = `
      #cadastro-overlay {
        position: fixed; inset: 0; z-index: 100;
        display: flex; align-items: center; justify-content: center;
        background: #1a1018; padding: 16px;
        font-family: monospace; -webkit-tap-highlight-color: transparent;
      }
      #cadastro-overlay .bb-card {
        width: 100%; max-width: 340px; text-align: center;
        background: #241620; border: 2px solid #FFD700; border-radius: 12px;
        padding: 22px 18px;
      }
      #cadastro-overlay .bb-title { color: #FFD700; font-size: 22px; margin: 0 0 2px; }
      #cadastro-overlay .bb-sub { color: #fff; font-size: 13px; margin: 0 0 16px; }
      #cadastro-overlay .bb-input {
        display: block; width: 100%; box-sizing: border-box;
        padding: 12px; margin: 0 0 10px; font-size: 16px; /* 16px = sem zoom no iOS */
        background: #1a1018; color: #fff;
        border: 2px solid #FFD700; border-radius: 8px; outline: none;
      }
      #cadastro-overlay .bb-input::placeholder { color: #9a8f86; }
      #cadastro-overlay .bb-err { color: #ff5555; font-size: 12px; min-height: 16px; margin: 2px 0 8px; }
      #cadastro-overlay .bb-btn {
        width: 100%; padding: 13px; font-size: 18px; font-weight: bold; font-family: monospace;
        color: #1a1018; background: #FFD700; border: none; border-radius: 8px; cursor: pointer;
      }
      #cadastro-overlay .bb-btn:disabled { opacity: 0.6; }
    `;
    document.head.appendChild(style);
  }

  _cleanup() {
    if (this._overlay) { this._overlay.remove(); this._overlay = null; }
  }
}
