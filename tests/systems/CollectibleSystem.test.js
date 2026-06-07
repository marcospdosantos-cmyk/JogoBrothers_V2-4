// tests/systems/CollectibleSystem.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { CollectibleSystem } from '../../src/systems/CollectibleSystem.js';
import { SCORE, INGREDIENTS } from '../../src/config/game.js';

describe('CollectibleSystem', () => {
  let sys;
  beforeEach(() => { sys = new CollectibleSystem(); });

  it('starts with 0 score', () => {
    expect(sys.score).toBe(0);
  });

  it('collectFries adds SCORE.FRIES', () => {
    sys.collectFries();
    expect(sys.score).toBe(SCORE.FRIES);
  });

  it('collectIngredient adds SCORE.INGREDIENT', () => {
    sys.collectIngredient('pao');
    expect(sys.score).toBe(SCORE.INGREDIENT);
  });

  it('collecting same ingredient twice does not double-count', () => {
    sys.collectIngredient('pao');
    sys.collectIngredient('pao');
    expect(sys.score).toBe(SCORE.INGREDIENT);
  });

  it('invalid ingredient ignored', () => {
    sys.collectIngredient('pizza');
    expect(sys.score).toBe(0);
  });

  it('getBurgerBonus returns 0 if not all collected', () => {
    sys.collectIngredient('pao');
    expect(sys.getBurgerBonus()).toBe(0);
  });

  it('getBurgerBonus returns BURGER_BONUS if all collected', () => {
    INGREDIENTS.forEach(i => sys.collectIngredient(i));
    expect(sys.getBurgerBonus()).toBe(SCORE.BURGER_BONUS);
  });

  it('hasIngredient returns correct value', () => {
    expect(sys.hasIngredient('pao')).toBe(false);
    sys.collectIngredient('pao');
    expect(sys.hasIngredient('pao')).toBe(true);
  });

  it('reset clears everything', () => {
    sys.collectFries();
    sys.collectIngredient('pao');
    sys.reset();
    expect(sys.score).toBe(0);
    expect(sys.hasIngredient('pao')).toBe(false);
  });
});
