// src/entities/Player.js
import Phaser from 'phaser';
import { PowerUpSystem } from '../systems/PowerUpSystem.js';
import { Potato } from './Potato.js';
import { PHYSICS, PLAYER_STATE, LIVES, INVINCIBILITY_MS } from '../config/game.js';

const COYOTE_MS = 110;     // grace window to still jump just after leaving a ledge
const THROW_COOLDOWN_MS = 280;
const JUMP_CUT = 0.45;     // velocity kept when the jump button is released early

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, character) {
    const key = character === 1 ? 'char1' : 'char2';
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.powerUpSystem = new PowerUpSystem();
    this.lives = LIVES;
    this.character = character;
    this._key = key;
    this._dirX = 1; // facing right

    this._controlsScrambled = false;
    this._coyote = 0;
    this._jumping = false;
    this._jumpCut = false;
    this._isSpinning = false;
    this._nextThrow = 0;

    this.setCollideWorldBounds(true);
    this.setGravityY(PHYSICS.GRAVITY);
    this._applyBodySize();
    this._buildAnims(scene, key);
    this.anims.play(`${key}_idle`, true);
  }

  _applyBodySize() {
    if (this.powerUpSystem.state === PLAYER_STATE.SMALL) {
      this.setScale(2); this.body.setSize(12, 20);
    } else {
      this.setScale(3); this.body.setSize(12, 22);
    }
  }

  _buildAnims(scene, key) {
    const anims = scene.anims;
    const makeAnim = (animKey, frames, rate, repeat = -1) => {
      if (!anims.exists(animKey)) {
        anims.create({ key: animKey, frames: anims.generateFrameNumbers(key, { frames }), frameRate: rate, repeat });
      }
    };
    makeAnim(`${key}_idle`,     [0],          4);
    makeAnim(`${key}_walk`,     [1, 2, 3, 4], 10);
    makeAnim(`${key}_jump`,     [5],          4, 0);
    makeAnim(`${key}_spin`,     [6, 7],       16);
    makeAnim(`${key}_big_idle`, [8],          4);
    makeAnim(`${key}_big_walk`, [9, 10, 11],  10);
  }

  update(ctrl) {
    const onGround = this.body.blocked.down || this.body.touching.down;
    const delta = this.scene.game.loop.delta;

    if (onGround) {
      this._coyote = COYOTE_MS;
      this._jumping = false;
      this._jumpCut = false;
      this._isSpinning = false;
    } else {
      this._coyote = Math.max(0, this._coyote - delta);
    }
    const canJump = onGround || this._coyote > 0;

    const speed = ctrl.run ? PHYSICS.RUN_SPEED : PHYSICS.SPEED;
    const isBig = this.powerUpSystem.state !== PLAYER_STATE.SMALL;
    const prefix = `${this._key}${isBig ? '_big' : ''}`;

    // Horizontal movement (air control allowed)
    if (ctrl.left) {
      this.setVelocityX(-speed); this.setFlipX(true); this._dirX = -1;
    } else if (ctrl.right) {
      this.setVelocityX(speed); this.setFlipX(false); this._dirX = 1;
    } else {
      this.setVelocityX(0);
    }

    // Jumps (edge-triggered — fire once per press)
    if (ctrl.spinJump && canJump) {
      this.setVelocityY(PHYSICS.SPIN_JUMP_VY);
      this._coyote = 0; this._jumping = true; this._jumpCut = false; this._isSpinning = true;
      this._playJumpSfx();
    } else if (ctrl.jump && canJump) {
      this.setVelocityY(PHYSICS.JUMP_VY);
      this._coyote = 0; this._jumping = true; this._jumpCut = false; this._isSpinning = false;
      this._playJumpSfx();
    }

    // Variable jump height: releasing the button early cuts the rise once
    if (this._jumping && !this._jumpCut && !ctrl.jumpHeld && this.body.velocity.y < 0) {
      this.body.velocity.y *= JUMP_CUT;
      this._jumpCut = true;
    }

    // Throw (edge-triggered + cooldown)
    if (ctrl.throwPotato && this.scene.time.now >= this._nextThrow) {
      if (this.throwPotato()) this._nextThrow = this.scene.time.now + THROW_COOLDOWN_MS;
    }

    // Animation selection
    if (!onGround) {
      this.anims.play(this._isSpinning ? `${this._key}_spin` : `${this._key}_jump`, true);
    } else if (ctrl.left || ctrl.right) {
      this.anims.play(`${prefix}_walk`, true);
    } else {
      this.anims.play(`${prefix}_idle`, true);
    }
  }

  _playJumpSfx() {
    if (this.scene.cache.audio.exists('sfx_jump')) this.scene.sound.play('sfx_jump');
  }

  throwPotato() {
    if (!this.powerUpSystem.canThrow()) return null;
    const potato = new Potato(this.scene, this.x + this._dirX * 20, this.y, this._dirX);
    this.scene.events.emit('potato_thrown', potato);
    return potato;
  }

  applyMushroom() {
    this.powerUpSystem.applyMushroom();
    this._applyBodySize();
    if (this.scene.cache.audio.exists('sfx_powerup')) this.scene.sound.play('sfx_powerup');
  }

  applyPotato() {
    this.powerUpSystem.applyPotato();
    if (this.scene.cache.audio.exists('sfx_powerup')) this.scene.sound.play('sfx_powerup');
  }

  activateInvincibility() {
    this.powerUpSystem.activateInvincibility(INVINCIBILITY_MS);
    this.scene.tweens.add({
      targets: this, alpha: 0.3, duration: 80, yoyo: true, repeat: 60,
      onComplete: () => this.setAlpha(1),
    });
  }

  takeDamage() {
    if (this.powerUpSystem.isInvincible()) return 'invincible';
    const died = this.powerUpSystem.applyDamage();
    this._applyBodySize();
    if (this.scene.cache.audio.exists('sfx_damage')) this.scene.sound.play('sfx_damage');
    if (died) {
      this.lives--;
      return this.lives <= 0 ? 'game_over' : 'life_lost';
    }
    // Brief invincibility frames after a non-fatal hit
    this.powerUpSystem._invincible = true;
    this.scene.tweens.add({
      targets: this, alpha: 0.3, duration: 100, yoyo: true, repeat: 8,
      onComplete: () => { this.setAlpha(1); this.powerUpSystem._invincible = false; },
    });
    return 'damaged';
  }

  isSpinJumping() {
    return this._isSpinning && !(this.body.blocked.down || this.body.touching.down);
  }

  reset(x, y) {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.powerUpSystem.reset();
    this._applyBodySize();
    this.setAlpha(1);
    this._controlsScrambled = false;
    this._coyote = 0;
    this._jumping = false;
    this._jumpCut = false;
    this._isSpinning = false;
    this.anims.play(`${this._key}_idle`, true);
  }
}
