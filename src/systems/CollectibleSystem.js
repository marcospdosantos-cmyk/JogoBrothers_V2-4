// src/systems/CollectibleSystem.js
import { INGREDIENTS, SCORE } from '../config/game.js';

export class CollectibleSystem {
  constructor() {
    this.score = 0;
    this._collected = new Set();
  }

  collectFries() {
    this.score += SCORE.FRIES;
  }

  collectIngredient(type) {
    if (!INGREDIENTS.includes(type) || this._collected.has(type)) return;
    this._collected.add(type);
    this.score += SCORE.INGREDIENT;
  }

  getBurgerBonus() {
    return INGREDIENTS.every(i => this._collected.has(i)) ? SCORE.BURGER_BONUS : 0;
  }

  hasIngredient(type)  { return this._collected.has(type); }
  getCollected()       { return [...this._collected]; }

  reset() {
    this.score = 0;
    this._collected = new Set();
  }
}
