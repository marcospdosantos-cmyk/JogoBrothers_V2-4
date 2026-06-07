// src/systems/HUDSystem.js
import { GAME_W, INGREDIENTS, PLAYER_STATE } from '../config/game.js';

export class HUDSystem {
  constructor(scene) {
    this._scene = scene;
    this._elements = {};
    this._ingredientIcons = {};
    this._build();
  }

  _build() {
    const s = this._scene;
    const depth = 100;

    // Score label
    this._elements.scoreLabel = s.add.text(12, 8, 'SCORE', { fontSize: '10px', fill: '#ffdd00', fontFamily: 'monospace' })
      .setScrollFactor(0).setDepth(depth);
    this._elements.scoreValue = s.add.text(12, 20, '0', { fontSize: '16px', fill: '#ffffff', fontFamily: 'monospace' })
      .setScrollFactor(0).setDepth(depth);

    // Lives
    this._elements.livesLabel = s.add.text(GAME_W / 2 - 20, 8, 'VIDAS', { fontSize: '10px', fill: '#ffdd00', fontFamily: 'monospace' })
      .setScrollFactor(0).setDepth(depth);
    this._elements.livesValue = s.add.text(GAME_W / 2 - 8, 20, '3', { fontSize: '16px', fill: '#ff4444', fontFamily: 'monospace' })
      .setScrollFactor(0).setDepth(depth);

    // Power-up indicator
    this._elements.powerLabel = s.add.text(GAME_W - 80, 8, 'PODER', { fontSize: '10px', fill: '#ffdd00', fontFamily: 'monospace' })
      .setScrollFactor(0).setDepth(depth);
    this._elements.powerValue = s.add.text(GAME_W - 80, 20, '-', { fontSize: '10px', fill: '#aaffaa', fontFamily: 'monospace' })
      .setScrollFactor(0).setDepth(depth);

    // Ingredient icons row (bottom-left above controls)
    const startX = 12;
    const iconY = 60;
    INGREDIENTS.forEach((name, i) => {
      const icon = s.add.image(startX + i * 22, iconY, 'collectibles', i)
        .setScrollFactor(0).setDepth(depth).setScale(1.5).setAlpha(0.3);
      this._ingredientIcons[name] = icon;
    });
  }

  updateScore(value) {
    this._elements.scoreValue.setText(String(value));
  }

  updateLives(value) {
    this._elements.livesValue.setText(String(value));
  }

  updatePowerState(state) {
    const labels = {
      [PLAYER_STATE.SMALL]:   '-',
      [PLAYER_STATE.GIANT]:   'GIGANTE',
      [PLAYER_STATE.THROWER]: 'ARREMESSO',
    };
    this._elements.powerValue.setText(labels[state] || '-');
  }

  updateIngredients(collectedSet) {
    INGREDIENTS.forEach(name => {
      const icon = this._ingredientIcons[name];
      if (icon) icon.setAlpha(collectedSet.has(name) ? 1 : 0.3);
    });
  }

  showBurgerBonus() {
    const bonus = this._scene.add.text(GAME_W / 2, 80, '+500 BURGER COMPLETO!', {
      fontSize: '18px', fill: '#ffdd00', fontFamily: 'monospace', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    this._scene.tweens.add({
      targets: bonus, y: 50, alpha: 0, duration: 1800,
      onComplete: () => bonus.destroy()
    });
  }

  destroy() {
    Object.values(this._elements).forEach(el => el.destroy());
    Object.values(this._ingredientIcons).forEach(el => el.destroy());
  }
}
