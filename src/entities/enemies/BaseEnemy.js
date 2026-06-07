// src/entities/enemies/BaseEnemy.js
import Phaser from 'phaser';

export class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, frame = 0) {
    super(scene, x, y, key, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBounce(0);
    this._dead = false;
  }

  isDead() { return this._dead; }

  takeDamage() {
    if (this._dead) return;
    this._dead = true;
    this.setVelocity(0);
    this.scene.tweens.add({
      targets: this, alpha: 0, y: this.y - 24, duration: 300,
      onComplete: () => this.destroy()
    });
  }

  update() {}
}
