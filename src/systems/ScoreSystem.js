// src/systems/ScoreSystem.js
import { SCORE } from '../config/game.js';

export class ScoreSystem {
  constructor() { this.total = 0; }
  add(pts)               { this.total += pts; }
  addBurgerBonus(hasAll) { if (hasAll) this.total += SCORE.BURGER_BONUS; }
  reset()                { this.total = 0; }
}
