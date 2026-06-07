// src/entities/enemies/Cebola.js
import { BaseEnemy } from './BaseEnemy.js';

export class Cebola extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemies', 3); // frame 3
    this._speed = 90;
    this.setVelocityX(-this._speed);
    this._buildAnims(scene);
    this.anims.play('cebola_walk');
  }

  _buildAnims(scene) {
    if (!scene.anims.exists('cebola_walk')) {
      scene.anims.create({ key: 'cebola_walk', frames: scene.anims.generateFrameNumbers('enemies', { frames: [3, 4] }), frameRate: 8, repeat: -1 });
    }
  }

  onHitPlayer(player) {
    if (this._dead) return;
    if (player.powerUpSystem.isInvincible()) return;
    player._controlsScrambled = true;
    this.scene.events.emit('controls_scrambled');
    this.scene.time.delayedCall(3000, () => { player._controlsScrambled = false; });
  }

  update() {
    if (this._dead) return;
    if (this.body.blocked.left)  this.setVelocityX( this._speed);
    if (this.body.blocked.right) this.setVelocityX(-this._speed);
  }
}
