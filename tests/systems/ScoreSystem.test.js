// tests/systems/ScoreSystem.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreSystem } from '../../src/systems/ScoreSystem.js';
import { SCORE } from '../../src/config/game.js';

describe('ScoreSystem', () => {
  let sys;
  beforeEach(() => { sys = new ScoreSystem(); });

  it('starts at 0', () => expect(sys.total).toBe(0));

  it('add() accumulates', () => {
    sys.add(100);
    sys.add(50);
    expect(sys.total).toBe(150);
  });

  it('addBurgerBonus adds BURGER_BONUS when true', () => {
    sys.addBurgerBonus(true);
    expect(sys.total).toBe(SCORE.BURGER_BONUS);
  });

  it('addBurgerBonus adds nothing when false', () => {
    sys.addBurgerBonus(false);
    expect(sys.total).toBe(0);
  });

  it('reset sets to 0', () => {
    sys.add(999);
    sys.reset();
    expect(sys.total).toBe(0);
  });
});
