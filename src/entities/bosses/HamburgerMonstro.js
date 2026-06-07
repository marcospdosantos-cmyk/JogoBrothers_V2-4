// src/entities/bosses/HamburgerMonstro.js
import Phaser from 'phaser';
import { BaseEnemy } from '../enemies/BaseEnemy.js';

export class HamburgerMonstro extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'bosses', 0);
    this._hp     = 5;
    this._speed  = 50;
    this.setScale(3);
    this.body.setSize(24, 30);
    this._buildAnims(scene);
    this.anims.play('monstro_walk');
    this.setVelocityX(-this._speed);

    // Spit grease every 3s
    this._spitTimer = scene.time.addEvent({
      delay: 3000, loop: true, callback: this._spit, callbackScope: this
    });
  }

  _buildAnims(scene) {
    if (!scene.anims.exists('monstro_walk')) {
      scene.anims.create({ key: 'monstro_walk', frames: scene.anims.generateFrameNumbers('bosses', { frames: [0, 1] }), frameRate: 5, repeat: -1 });
    }
    if (!scene.anims.exists('monstro_hurt')) {
      scene.anims.create({ key: 'monstro_hurt', frames: scene.anims.generateFrameNumbers('bosses', { frames: [2] }), frameRate: 4, repeat: 0 });
    }
  }

  _spit() {
    if (this._dead || !this.active) return;
    const dirX = this.flipX ? 1 : -1;
    const grease = this.scene.physics.add.image(this.x + dirX * 30, this.y, 'bosses', 3);
    grease.setVelocityX(dirX * 220);
    grease.setVelocityY(-60);
    grease.setGravityY(200);
    this.scene.events.emit('boss_projectile', grease);
    this.scene.time.delayedCall(3000, () => { if (grease.active) grease.destroy(); });
  }

  takeDamage(amount = 1) {
    if (this._dead) return;
    this._hp -= amount;
    this.anims.play('monstro_hurt', true);
    this.scene.cameras.main.shake(120, 0.004);
    if (this._hp <= 0) {
      this._spitTimer.remove();
      super.takeDamage();
    } else {
      this.scene.time.delayedCall(200, () => {
        if (this.active) this.anims.play('monstro_walk', true);
      });
    }
  }

  update(delta) {
    if (this._dead) return;
    if (this.body.blocked.left)  { this.setVelocityX( this._speed); this.setFlipX(true); }
    if (this.body.blocked.right) { this.setVelocityX(-this._speed); this.setFlipX(false); }
  }
}
