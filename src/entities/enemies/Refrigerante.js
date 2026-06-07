// src/entities/enemies/Refrigerante.js
import { BaseEnemy } from './BaseEnemy.js';

const EXPLOSION_RADIUS = 80;

export class Refrigerante extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemies', 7); // frame 7
    this._originX = x;
    this._originY = y;
    this.body.setAllowGravity(true);
    this._buildAnims(scene);
    this._scheduleExplode();
  }

  _buildAnims(scene) {
    if (!scene.anims.exists('refri_idle')) {
      scene.anims.create({ key: 'refri_idle', frames: scene.anims.generateFrameNumbers('enemies', { frames: [7] }), frameRate: 4, repeat: -1 });
    }
    if (!scene.anims.exists('refri_fuse')) {
      scene.anims.create({ key: 'refri_fuse', frames: scene.anims.generateFrameNumbers('enemies', { frames: [7, 8] }), frameRate: 12, repeat: -1 });
    }
  }

  _scheduleExplode() {
    this.anims.play('refri_idle');
    this.scene.time.delayedCall(2000, () => {
      if (this._dead || !this.active) return;
      this.anims.play('refri_fuse');
      this.scene.time.delayedCall(800, () => {
        if (this._dead || !this.active) return;
        this.scene.events.emit('explosion', this.x, this.y, EXPLOSION_RADIUS);
        this.setAlpha(0);
        this.body.enable = false;
        this.scene.time.delayedCall(4000, () => {
          if (!this.active) return;
          this.setAlpha(1);
          this.body.enable = true;
          this._scheduleExplode();
        });
      });
    });
  }

  takeDamage() {
    if (this._dead) return;
    // Hitting a Refrigerante early triggers an instant explosion
    this.scene.events.emit('explosion', this.x, this.y, EXPLOSION_RADIUS);
    super.takeDamage();
  }

  update() {}
}
