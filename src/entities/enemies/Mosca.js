// src/entities/enemies/Mosca.js
import { BaseEnemy } from './BaseEnemy.js';

export class Mosca extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemies', 5); // frame 5
    this._speed = 80;
    this._originY = y;
    this._t = 0;
    this.body.setAllowGravity(false);
    this.setVelocityX(-this._speed);
    this._buildAnims(scene);
    this.anims.play('mosca_fly');
  }

  _buildAnims(scene) {
    if (!scene.anims.exists('mosca_fly')) {
      scene.anims.create({ key: 'mosca_fly', frames: scene.anims.generateFrameNumbers('enemies', { frames: [5, 6] }), frameRate: 10, repeat: -1 });
    }
  }

  // Mosca can only be defeated by spin jump or potato (not regular stomp)
  canBeStopped() { return false; }

  update(delta) {
    if (this._dead) return;
    this._t += delta * 0.002;
    this.y = this._originY + Math.sin(this._t) * 30;
    if (this.body.blocked.left)  this.setVelocityX( this._speed);
    if (this.body.blocked.right) this.setVelocityX(-this._speed);
  }
}
