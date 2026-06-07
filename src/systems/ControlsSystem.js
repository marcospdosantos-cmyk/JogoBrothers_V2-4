// src/systems/ControlsSystem.js
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config/game.js';

// Builds virtual SNES-style controls over the game canvas.
// Exposes a `state` object read each frame by Player.update().
export class ControlsSystem {
  constructor(scene) {
    this.scene = scene;
    this.state = { left: false, right: false, down: false, jump: false, run: false, spinJump: false, throwPotato: false };

    this._joystickBase = null;
    this._joystickThumb = null;
    this._joystickId = null;
    this._joystickOrigin = { x: 0, y: 0 };
    this._btns = {};

    this._buildJoystick();
    this._buildButtons();
  }

  _buildJoystick() {
    const bx = 90, by = GAME_H - 90, r = 60;
    this._joystickBase  = this.scene.add.circle(bx, by, r, 0xffffff, 0.15).setDepth(10).setScrollFactor(0);
    this._joystickThumb = this.scene.add.circle(bx, by, 25, 0xffffff, 0.4).setDepth(11).setScrollFactor(0);

    const zone = this.scene.add.zone(bx, by, r * 2, r * 2).setInteractive().setDepth(12).setScrollFactor(0);
    zone.on('pointerdown', (p) => {
      this._joystickId = p.id;
      this._joystickOrigin = { x: p.x, y: p.y };
    });
    this.scene.input.on('pointermove', (p) => {
      if (p.id !== this._joystickId) return;
      const dx = p.x - this._joystickOrigin.x;
      const dy = p.y - this._joystickOrigin.y;
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy), r);
      const angle = Math.atan2(dy, dx);
      this._joystickThumb.setPosition(
        this._joystickBase.x + Math.cos(angle) * dist,
        this._joystickBase.y + Math.sin(angle) * dist
      );
      const threshold = 15;
      this.state.left  = dx < -threshold;
      this.state.right = dx > threshold;
      this.state.down  = dy > threshold;
    });
    this.scene.input.on('pointerup', (p) => {
      if (p.id !== this._joystickId) return;
      this._joystickId = null;
      this._joystickThumb.setPosition(this._joystickBase.x, this._joystickBase.y);
      this.state.left = this.state.right = this.state.down = false;
    });
  }

  // SNES layout: B bottom-center, A right, X top-center, Y left
  _buildButtons() {
    const rx = GAME_W - 90, ry = GAME_H - 90, gap = 38;
    const defs = [
      { key: 'jump',        label: 'B', x: rx,        y: ry,         color: 0x4444ff },
      { key: 'throwPotato', label: 'A', x: rx + gap,  y: ry - gap,   color: 0xff4444 },
      { key: 'run',         label: 'X', x: rx,        y: ry - gap*2, color: 0xaaaaff },
      { key: 'spinJump',    label: 'Y', x: rx - gap,  y: ry - gap,   color: 0xffaa00 },
    ];

    for (const def of defs) {
      const circle = this.scene.add.circle(def.x, def.y, 22, def.color, 0.7)
        .setDepth(10).setScrollFactor(0).setInteractive();
      this.scene.add.text(def.x, def.y, def.label, { fontSize: '14px', fill: '#fff', fontStyle: 'bold' })
        .setOrigin(0.5).setDepth(11).setScrollFactor(0);
      circle.on('pointerdown', () => { this.state[def.key] = true; });
      this.scene.input.on('pointerup', () => { this.state[def.key] = false; });
      this._btns[def.key] = circle;
    }
  }

  destroy() {
    this._joystickBase.destroy();
    this._joystickThumb.destroy();
    Object.values(this._btns).forEach(b => b.destroy());
  }
}
