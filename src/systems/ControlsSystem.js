// src/systems/ControlsSystem.js
import '../phaser-global.js'; // MUST come before the rex import (sets global Phaser)
import VirtualJoyStick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';
import { GAME_W, GAME_H } from '../config/game.js';

// Virtual SNES-style controls over the game canvas.
//
// The directional pad is the rexVirtualJoyStick plugin: production-grade,
// multi-touch, analog, and scroll-safe (fixed:true sets scrollFactor 0 and the
// plugin compensates for camera scroll internally). The four action buttons
// (B/A/X/Y) stay hand-rolled so we keep the exact SNES layout, edge-triggered
// presses, and per-pointer release tracking.
//
// Held state (left/right/down/run/jumpHeld) reflects what's currently active.
// Edge state (jump/spinJump/throwPotato) is true only for the single frame the
// button was pressed — GameScene calls clearPressed() at the end of each update.
const RUN_FORCE_RATIO = 0.82; // push the stick past this fraction of its radius to run

export class ControlsSystem {
  constructor(scene) {
    this.scene = scene;

    this._held = { run: false, jumpHeld: false };
    this._pressed = { jump: false, spinJump: false, throwPotato: false };

    this._btns = {};
    this._pointerButton = {}; // pointerId -> button key (correct multi-touch release)
    this._onUp = this._handleUp.bind(this);

    this._buildJoystick();
    this._buildButtons();

    this.scene.input.on('pointerup', this._onUp);
    this.scene.input.on('pointerupoutside', this._onUp);
    this.scene.input.on('gameout', this._onUp);
  }

  _buildJoystick() {
    const bx = 96, by = GAME_H - 90;
    this._radius = 64;

    const base = this.scene.add.circle(bx, by, this._radius, 0xffffff, 0.12)
      .setStrokeStyle(3, 0xffffff, 0.35).setDepth(40);
    const thumb = this.scene.add.circle(bx, by, 28, 0xffffff, 0.45).setDepth(41);

    this._joystick = new VirtualJoyStick(this.scene, {
      x: bx, y: by,
      radius: this._radius,
      base,
      thumb,
      dir: '8dir',
      forceMin: 14,   // dead zone so a resting thumb doesn't drift
      fixed: true,    // sets scrollFactor 0 on base/thumb; plugin is scroll-safe
    });
  }

  // SNES layout: B bottom-center (jump), A right (throw), X top-center (run), Y left (spin)
  _buildButtons() {
    const rx = GAME_W - 92, ry = GAME_H - 88, gap = 46, radius = 28;
    const defs = [
      { key: 'jump',        label: 'B', x: rx,         y: ry,           color: 0x4466ff },
      { key: 'throwPotato', label: 'A', x: rx + gap,   y: ry - gap,     color: 0xff4455 },
      { key: 'run',         label: 'X', x: rx,         y: ry - gap * 2, color: 0x99aaff },
      { key: 'spinJump',    label: 'Y', x: rx - gap,   y: ry - gap,     color: 0xffaa22 },
    ];

    for (const def of defs) {
      const circle = this.scene.add.circle(def.x, def.y, radius, def.color, 0.65)
        .setDepth(40).setScrollFactor(0)
        .setStrokeStyle(3, 0xffffff, 0.4)
        .setInteractive();
      this.scene.add.text(def.x, def.y, def.label, { fontSize: '18px', color: '#fff', fontStyle: 'bold' })
        .setOrigin(0.5).setDepth(41).setScrollFactor(0);

      circle.on('pointerdown', (p) => {
        this._pointerButton[p.id] = def.key;
        circle.setFillStyle(def.color, 1);   // visual press feedback
        circle.setScale(0.9);
        this._press(def.key);
      });

      this._btns[def.key] = { circle, color: def.color };
    }
  }

  _press(key) {
    if (key === 'run') { this._held.run = true; return; }
    if (key === 'jump') { this._held.jumpHeld = true; this._pressed.jump = true; return; }
    if (key === 'spinJump') { this._held.jumpHeld = true; this._pressed.spinJump = true; return; }
    if (key === 'throwPotato') { this._pressed.throwPotato = true; return; }
  }

  _handleUp(p) {
    const key = p ? this._pointerButton[p.id] : null;
    if (!key) return;
    delete this._pointerButton[p.id];
    const btn = this._btns[key];
    if (btn) { btn.circle.setFillStyle(btn.color, 0.65); btn.circle.setScale(1); }
    if (key === 'run') this._held.run = false;
    if (key === 'jump' || key === 'spinJump') {
      const stillHeld = Object.values(this._pointerButton).some(k => k === 'jump' || k === 'spinJump');
      if (!stillHeld) this._held.jumpHeld = false;
    }
  }

  getState() {
    const j = this._joystick;
    const forceRatio = Math.min(j.force / this._radius, 1);
    return {
      left: j.left,
      right: j.right,
      down: j.down,
      // Analog: a full push runs even without the X button.
      run: this._held.run || forceRatio >= RUN_FORCE_RATIO,
      jumpHeld: this._held.jumpHeld,
      jump: this._pressed.jump,
      spinJump: this._pressed.spinJump,
      throwPotato: this._pressed.throwPotato,
    };
  }

  // Called by GameScene at the end of update() so edge presses fire exactly once.
  clearPressed() {
    this._pressed.jump = false;
    this._pressed.spinJump = false;
    this._pressed.throwPotato = false;
  }

  destroy() {
    this.scene.input.off('pointerup', this._onUp);
    this.scene.input.off('pointerupoutside', this._onUp);
    this.scene.input.off('gameout', this._onUp);
    this._joystick.destroy();
    Object.values(this._btns).forEach(b => b.circle.destroy());
  }
}
