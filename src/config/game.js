// src/config/game.js
export const GAME_W = 800;
export const GAME_H = 450;

export const PLAYER_STATE = { SMALL: 'small', GIANT: 'giant', THROWER: 'thrower' };

export const PHYSICS = {
  GRAVITY: 600,
  SPEED: 160,
  RUN_SPEED: 240,
  JUMP_VY: -380,
  SPIN_JUMP_VY: -320,
};

export const SCORE = {
  FRIES: 10,
  INGREDIENT: 50,
  BURGER_BONUS: 500,
};

export const INGREDIENTS = ['pao', 'alface', 'tomate', 'molho', 'bacon', 'hamburger'];
export const LIVES = 3;
export const INVINCIBILITY_MS = 10000;

export const PHASES = {
  1: { key: 'fase1', tilemap: 'fase1', tileset: 'cozinha', music: 'fase1', boss: false },
  2: { key: 'fase2', tilemap: 'fase2', tileset: 'rua',     music: 'fase2', boss: 'boss1' },
  3: { key: 'fase3', tilemap: 'fase3', tileset: 'mercado', music: 'fase3', boss: false },
  4: { key: 'fase4', tilemap: 'fase4', tileset: 'restaurante', music: 'fase4', boss: 'boss2' },
};
