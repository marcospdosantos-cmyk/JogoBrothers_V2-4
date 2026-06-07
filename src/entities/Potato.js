// src/entities/Potato.js
import Phaser from 'phaser';

export class Potato extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, dirX) {
    super(scene, x, y, 'collectibles', 6); // frame 6 = batata crua in spritesheet
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVelocityX(dirX * 400);
    this.setVelocityY(-80);
    this.setGravityY(300);
    scene.time.delayedCall(2500, () => { if (this.active) this.destroy(); });
  }
}
