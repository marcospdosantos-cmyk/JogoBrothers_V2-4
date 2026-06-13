// src/systems/ControlsSystem.js
import { GAME_W, GAME_H } from '../config/game.js';

// Virtual SNES-style controls over the game canvas.
//
// Held state (left/right/down/run/jumpHeld) reflects whether the input is
// currently active. Edge state (jump/spinJump/throwPotato) is true only for the
// single frame the button was pressed — GameScene calls clearPressed() at the
// end of each update so a held finger never re-triggers.
//
// Multi-touch is required: a player must move the joystick with one thumb while
// pressing a button with the other. Each pointer id is tracked independently so
// releasing one finger never cancels another finger's button.
export class ControlsSystem {
  constructor(scene) {
    this.scene = scene;

    this._held = { left: false, right: false, down: false, run: false, jumpHeld: false };
    this._pressed = { jump: false, spinJump: false, throwPotato: false };

    this._joystickId = null;
    this._joystickOrigin = { x: 0, y: 0 };
    this._joystickRadius = 64;

    this._btns = {};
    this._pointerButton = {}; // pointerId -> button key (for correct multi-touch release)

    // Bound handlers so we can detach them on destroy (scene.restart reuses input).
    this._onMove = this._handleMove.bind(this);
    this._onUp = this._handleUp.bind(this);

    this._build();
  }

  _build() {
    this._buildJoystick();
    this._buildButtons();
    this.scene.input.on('pointermove', this._onMove);
    this.scene.input.on('pointerup', this._onUp);
    this.scene.input.on('pointerupoutside', this._onUp);
    this.scene.input.on('gameout', this._onUp);
  }

  _buildJoystick() {
    const bx = 96, by = GAME_H - 90, r = this._joystickRadius;
    this._joystickBase = this.scene.add.circle(bx, by, r, 0xffffff, 0.12)
      .setDepth(40).setScrollFactor(0).setStrokeStyle(3, 0xffffff, 0.35);
    this._joystickThumb = this.scene.add.circle(bx, by, 28, 0xffffff, 0.45)
      .setDepth(41).setScrollFactor(0);

    // A generous square zone so the thumb is easy to find without looking.
    const zone = this.scene.add.zone(bx, by, r * 2.4, r * 2.4)
      .setInteractive().setDepth(42).setScrollFactor(0);
    zone.on('pointerdown', (p) => {
      if (this._joystickId !== null) return; // already tracking a finger
      this._joystickId = p.id;
      this._joystickOrigin = { x: p.x, y: p.y };
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
        circle.setFillStyle(def.color, 1);          // visual press feedback
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

  _handleMove(p) {
    if (p.id !== this._joystickId) return;
    const r = this._joystickRadius;
    const dx = p.x - this._joystickOrigin.x;
    const dy = p.y - this._joystickOrigin.y;
    const dist = Math.min(Math.hypot(dx, dy), r);
    const angle = Math.atan2(dy, dx);
    this._joystickThumb.setPosition(
      this._joystickBase.x + Math.cos(angle) * dist,
      this._joystickBase.y + Math.sin(angle) * dist,
    );
    const threshold = 14;
    this._held.left = dx < -threshold;
    this._held.right = dx > threshold;
    this._held.down = dy > threshold;
  }

  _handleUp(p) {
    // Joystick release
    if (p && p.id === this._joystickId) {
      this._joystickId = null;
      this._joystickThumb.setPosition(this._joystickBase.x, this._joystickBase.y);
      this._held.left = this._held.right = this._held.down = false;
    }
    // Button release — only the button this exact pointer pressed
    const key = p ? this._pointerButton[p.id] : null;
    if (key) {
      delete this._pointerButton[p.id];
      const btn = this._btns[key];
      if (btn) { btn.circle.setFillStyle(btn.color, 0.65); btn.circle.setScale(1); }
      if (key === 'run') this._held.run = false;
      if (key === 'jump' || key === 'spinJump') {
        // jumpHeld stays true only while a jump-style button is still down
        const stillHeld = Object.values(this._pointerButton).some(k => k === 'jump' || k === 'spinJump');
        if (!stillHeld) this._held.jumpHeld = false;
      }
    }
  }

  getState() {
    return {
      left: this._held.left,
      right: this._held.right,
      down: this._held.down,
      run: this._held.run,
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
    this.scene.input.off('pointermove', this._onMove);
    this.scene.input.off('pointerup', this._onUp);
    this.scene.input.off('pointerupoutside', this._onUp);
    this.scene.input.off('gameout', this._onUp);
    this._joystickBase.destroy();
    this._joystickThumb.destroy();
    Object.values(this._btns).forEach(b => b.circle.destroy());
  }
}
