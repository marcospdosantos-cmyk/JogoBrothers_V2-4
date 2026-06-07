// src/entities/enemies/Picles.js
import { BaseEnemy } from './BaseEnemy.js';

export class Picles extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemies', 0); // frame 0 in enemies spritesheet
    this._speed = 60;
    this.setVelocityX(-this._speed);
    this._buildAnims(scene);
    this.anims.play('picles_walk');
  }

  _buildAnims(scene) {
    if (!scene.anims.exists('picles_walk')) {
      scene.anims.create({ key: 'picles_walk', frames: scene.anims.generateFrameNumbers('enemies', { frames: [0, 1] }), frameRate: 6, repeat: -1 });
    }
    if (!scene.anims.exists('picles_squish')) {
      scene.anims.create({ key: 'picles_squish', frames: scene.anims.generateFrameNumbers('enemies', { frames: [2] }), frameRate: 4, repeat: 0 });
    }
  }

  update() {
    if (this._dead) return;
    if (this.body.blocked.left)  this.setVelocityX( this._speed);
    if (this.body.blocked.right) this.setVelocityX(-this._speed);
  }
}
