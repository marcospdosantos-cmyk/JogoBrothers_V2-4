// src/entities/bosses/Gordao.js
import { BaseEnemy } from '../enemies/BaseEnemy.js';

export class Gordao extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss2', 0);
    this._hp     = 8;
    this._speed  = 60;
    this._phase  = 1;
    this._charging = false;
    this.setScale(4);
    this.body.setSize(20, 28);
    this._buildAnims(scene);
    this.anims.play('gordao_walk');
    this.setVelocityX(-this._speed);
  }

  _buildAnims(scene) {
    if (!scene.anims.exists('gordao_walk')) {
      scene.anims.create({ key: 'gordao_walk', frames: scene.anims.generateFrameNumbers('boss2', { frames: [0, 1] }), frameRate: 5, repeat: -1 });
    }
    if (!scene.anims.exists('gordao_charge')) {
      scene.anims.create({ key: 'gordao_charge', frames: scene.anims.generateFrameNumbers('boss2', { frames: [2, 3] }), frameRate: 12, repeat: -1 });
    }
    if (!scene.anims.exists('gordao_hurt')) {
      scene.anims.create({ key: 'gordao_hurt', frames: scene.anims.generateFrameNumbers('boss2', { frames: [4] }), frameRate: 4, repeat: 0 });
    }
  }

  _startCharge() {
    if (this._dead || this._charging) return;
    this._charging = true;
    this.anims.play('gordao_charge', true);
    const dirX = (this.scene.children.getByName('player')?.x ?? 0) < this.x ? -1 : 1;
    this.setVelocityX(dirX * 280);
    this.scene.time.delayedCall(1500, () => {
      if (this._dead || !this.active) return;
      this.setVelocityX(0);
      this.scene.cameras.main.shake(200, 0.006);
      this.scene.events.emit('boss_stomp', this.x, this.y);
      this._charging = false;
      this.scene.time.delayedCall(1000, () => {
        if (!this._dead && this.active) {
          this.anims.play('gordao_walk', true);
          this._startCharge();
        }
      });
    });
  }

  takeDamage(amount = 1) {
    if (this._dead) return;
    this._hp -= amount;
    this.anims.play('gordao_hurt', true);
    this.scene.cameras.main.shake(150, 0.005);
    if (this._hp <= 0) {
      super.takeDamage();
      return;
    }
    if (this._hp <= 4 && this._phase === 1) {
      this._phase = 2;
      this._startCharge();
    }
    this.scene.time.delayedCall(200, () => {
      if (this.active && !this._charging) this.anims.play('gordao_walk', true);
    });
  }

  update(delta) {
    if (this._dead || this._charging) return;
    if (this.body.blocked.left)  { this.setVelocityX( this._speed); this.setFlipX(true); }
    if (this.body.blocked.right) { this.setVelocityX(-this._speed); this.setFlipX(false); }
  }
}
