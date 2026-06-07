// src/systems/PowerUpSystem.js
import { PLAYER_STATE } from '../config/game.js';

export class PowerUpSystem {
  constructor() {
    this.state = PLAYER_STATE.SMALL;
    this._invincible = false;
    this._invincibilityTimer = null;
  }

  applyMushroom() {
    if (this.state === PLAYER_STATE.SMALL) this.state = PLAYER_STATE.GIANT;
  }

  applyPotato() {
    if (this.state === PLAYER_STATE.GIANT || this.state === PLAYER_STATE.THROWER) {
      this.state = PLAYER_STATE.THROWER;
    }
  }

  applyDamage() {
    if (this._invincible) return false;
    if (this.state === PLAYER_STATE.THROWER) { this.state = PLAYER_STATE.GIANT; return false; }
    if (this.state === PLAYER_STATE.GIANT)   { this.state = PLAYER_STATE.SMALL; return false; }
    return true; // SMALL → died
  }

  activateInvincibility(ms = 10000) {
    this._invincible = true;
    clearTimeout(this._invincibilityTimer);
    this._invincibilityTimer = null;
    this._invincibilityTimer = setTimeout(() => { this._invincible = false; }, ms);
  }

  isInvincible() { return this._invincible; }
  canThrow()     { return this.state === PLAYER_STATE.THROWER; }

  reset() {
    this.state = PLAYER_STATE.SMALL;
    this._invincible = false;
    clearTimeout(this._invincibilityTimer);
    this._invincibilityTimer = null;
  }
}
