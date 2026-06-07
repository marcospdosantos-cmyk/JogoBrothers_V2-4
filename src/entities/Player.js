// src/entities/Player.js
import Phaser from 'phaser';
import { PowerUpSystem } from '../systems/PowerUpSystem.js';
import { Potato } from './Potato.js';
import { PHYSICS, PLAYER_STATE, LIVES, INVINCIBILITY_MS } from '../config/game.js';

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

    this.setCollideWorldBounds(true);
    this.setGravityY(PHYSICS.GRAVITY);
    this._applyBodySize();
    this._buildAnims(scene, key);
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
    makeAnim(`${key}_idle`,     [0],       4);
    makeAnim(`${key}_walk`,     [1,2,3,4], 10);
    makeAnim(`${key}_jump`,     [5],       4);
    makeAnim(`${key}_spin`,     [6,7],     12);
    makeAnim(`${key}_big_idle`, [8],       4);
    makeAnim(`${key}_big_walk`, [9,10,11], 10);
  }

  update(ctrl) {
    const onGround = this.body.blocked.down;
    const speed = ctrl.run ? PHYSICS.RUN_SPEED : PHYSICS.SPEED;
    const isBig = this.powerUpSystem.state !== PLAYER_STATE.SMALL;
    const prefix = `${this._key}${isBig ? '_big' : ''}`;

    if (ctrl.left) {
      this.setVelocityX(-speed); this.setFlipX(true); this._dirX = -1;
      this.anims.play(`${prefix}_walk`, true);
    } else if (ctrl.right) {
      this.setVelocityX(speed); this.setFlipX(false); this._dirX = 1;
      this.anims.play(`${prefix}_walk`, true);
    } else {
      this.setVelocityX(0);
      if (onGround) this.anims.play(`${prefix}_idle`, true);
    }

    if (ctrl.jump && onGround)     { this.setVelocityY(PHYSICS.JUMP_VY);      this.anims.play(`${this._key}_jump`, true); }
    if (ctrl.spinJump && onGround) { this.setVelocityY(PHYSICS.SPIN_JUMP_VY); this.anims.play(`${this._key}_spin`, true); }

    if (ctrl.throwPotato) this.throwPotato();
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
    this.scene.sound.play('sfx_powerup');
  }

  applyPotato() {
    this.powerUpSystem.applyPotato();
    this.scene.sound.play('sfx_powerup');
  }

  activateInvincibility() {
    this.powerUpSystem.activateInvincibility(INVINCIBILITY_MS);
    this.scene.tweens.add({ targets: this, alpha: 0.3, duration: 80, yoyo: true, repeat: 60,
      onComplete: () => this.setAlpha(1) });
  }

  takeDamage() {
    if (this.powerUpSystem.isInvincible()) return 'invincible';
    const died = this.powerUpSystem.applyDamage();
    this._applyBodySize();
    this.scene.sound.play('sfx_damage');
    if (died) {
      this.lives--;
      return this.lives <= 0 ? 'game_over' : 'life_lost';
    }
    // Grant brief invincibility frames after damage
    this.powerUpSystem._invincible = true;
    this.scene.tweens.add({ targets: this, alpha: 0.3, duration: 100, yoyo: true, repeat: 8,
      onComplete: () => { this.setAlpha(1); this.powerUpSystem._invincible = false; } });
    return 'damaged';
  }

  isSpinJumping() {
    return this.anims.currentAnim?.key.includes('spin') && !this.body.blocked.down;
  }

  reset(x, y) {
    this.setPosition(x, y);
    this.powerUpSystem.reset();
    this._applyBodySize();
    this.setAlpha(1);
    this._controlsScrambled = false;
  }
}
