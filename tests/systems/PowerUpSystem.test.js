// tests/systems/PowerUpSystem.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PowerUpSystem } from '../../src/systems/PowerUpSystem.js';
import { PLAYER_STATE } from '../../src/config/game.js';

describe('PowerUpSystem', () => {
  let sys;
  beforeEach(() => { sys = new PowerUpSystem(); });

  it('starts SMALL', () => {
    expect(sys.state).toBe(PLAYER_STATE.SMALL);
  });

  it('SMALL + mushroom → GIANT', () => {
    sys.applyMushroom();
    expect(sys.state).toBe(PLAYER_STATE.GIANT);
  });

  it('GIANT + mushroom → stays GIANT', () => {
    sys.applyMushroom();
    sys.applyMushroom();
    expect(sys.state).toBe(PLAYER_STATE.GIANT);
  });

  it('GIANT + potato → THROWER', () => {
    sys.applyMushroom();
    sys.applyPotato();
    expect(sys.state).toBe(PLAYER_STATE.THROWER);
  });

  it('SMALL + potato → stays SMALL (no effect without mushroom)', () => {
    sys.applyPotato();
    expect(sys.state).toBe(PLAYER_STATE.SMALL);
  });

  it('THROWER + damage → GIANT', () => {
    sys.applyMushroom();
    sys.applyPotato();
    const died = sys.applyDamage();
    expect(died).toBe(false);
    expect(sys.state).toBe(PLAYER_STATE.GIANT);
  });

  it('GIANT + damage → SMALL', () => {
    sys.applyMushroom();
    const died = sys.applyDamage();
    expect(died).toBe(false);
    expect(sys.state).toBe(PLAYER_STATE.SMALL);
  });

  it('SMALL + damage → died = true', () => {
    const died = sys.applyDamage();
    expect(died).toBe(true);
    expect(sys.state).toBe(PLAYER_STATE.SMALL);
  });

  it('canThrow() is false without potato', () => {
    sys.applyMushroom();
    expect(sys.canThrow()).toBe(false);
  });

  it('canThrow() is true with potato', () => {
    sys.applyMushroom();
    sys.applyPotato();
    expect(sys.canThrow()).toBe(true);
  });

  it('activateInvincibility sets isInvincible() true', () => {
    vi.useFakeTimers();
    sys.activateInvincibility(10000);
    expect(sys.isInvincible()).toBe(true);
    vi.useRealTimers();
  });

  it('reset() returns to SMALL', () => {
    sys.applyMushroom();
    sys.applyPotato();
    sys.reset();
    expect(sys.state).toBe(PLAYER_STATE.SMALL);
    expect(sys.canThrow()).toBe(false);
  });
});
