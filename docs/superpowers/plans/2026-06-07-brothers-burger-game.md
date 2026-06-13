# Brothers Burger Game — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first web platformer (Phaser.js 3) for Brothers Burger's reinauguration campaign, with 4 phases, 2 bosses, power-up system, and Supabase leaderboard.

**Architecture:** Phaser.js scenes manage game flow; pure JS classes handle business logic (PowerUpSystem, CollectibleSystem, ScoreSystem) tested with Vitest; Supabase handles player registration and monthly ranking; Vite builds and serves the app; Vercel hosts the final deploy.

**Tech Stack:** Phaser.js 3, Vite 5, Vitest, Supabase JS v2, Vercel

---

## File Structure

```
/
├── .env.local                          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js
├── public/
│   └── assets/
│       ├── sprites/                    # ⚠️ Pixel art assets — produced by designer
│       │   ├── char1.png              # Character 1 spritesheet (16 frames, 16×24px each)
│       │   ├── char2.png              # Character 2 spritesheet
│       │   ├── enemies.png            # Enemy spritesheet (all 5 enemies)
│       │   ├── bosses.png             # Boss spritesheet
│       │   ├── powerups.png           # Cogumelo, batata crua, estrela
│       │   ├── collectibles.png       # Ingredientes + batata frita
│       │   └── ui.png                 # HUD, botões, logo
│       ├── tilemaps/                  # ⚠️ Tile maps — built in Tiled editor
│       │   ├── fase1.json
│       │   ├── fase2.json
│       │   ├── fase3.json
│       │   └── fase4.json
│       ├── tilesets/                  # ⚠️ Tileset PNGs — produced by designer
│       │   ├── cozinha.png
│       │   ├── rua.png
│       │   ├── mercado.png
│       │   └── restaurante.png
│       └── audio/                     # ⚠️ Chiptune audio — produced by composer
│           ├── fase1.mp3
│           ├── fase2.mp3
│           ├── fase3.mp3
│           ├── fase4.mp3
│           ├── boss.mp3
│           └── sfx/jump.mp3, collect.mp3, powerup.mp3, damage.mp3, defeat.mp3
├── src/
│   ├── main.js                        # Phaser game config + scene registry
│   ├── config/
│   │   ├── game.js                    # Constants: sizes, speeds, scores
│   │   └── supabase.js                # Supabase client singleton
│   ├── scenes/
│   │   ├── BootScene.js               # Preload all assets + check localStorage
│   │   ├── CadastroScene.js           # Registration form (first visit only)
│   │   ├── MenuScene.js               # JOGAR / RANKING buttons
│   │   ├── SelectCharScene.js         # Pick character 1 or 2
│   │   ├── GameScene.js               # Core platformer loop (shared by all phases)
│   │   ├── GameOverScene.js           # Score + burger assembly + ranking position
│   │   └── RankingScene.js            # Top 10 leaderboard
│   ├── entities/
│   │   ├── Player.js                  # Player sprite + state + movement
│   │   ├── Potato.js                  # Thrown potato projectile
│   │   ├── enemies/
│   │   │   ├── BaseEnemy.js           # Shared enemy logic
│   │   │   ├── Picles.js
│   │   │   ├── Cebola.js
│   │   │   ├── Mosca.js
│   │   │   └── Refrigerante.js
│   │   └── bosses/
│   │       ├── HamburgerMonstro.js    # Boss fase 2
│   │       └── Gordao.js              # Boss fase 4
│   ├── systems/
│   │   ├── PowerUpSystem.js           # State machine: small/giant/thrower
│   │   ├── CollectibleSystem.js       # Ingredient tracking + burger bonus
│   │   ├── ScoreSystem.js             # Score accumulation
│   │   ├── ControlsSystem.js          # Virtual joystick + buttons
│   │   └── HUDSystem.js               # Lives, score, power-up indicator
│   └── services/
│       ├── PlayerService.js           # Supabase CRUD jogadores table
│       └── RankingService.js          # Supabase ranking queries
└── tests/
    ├── systems/
    │   ├── PowerUpSystem.test.js
    │   ├── CollectibleSystem.test.js
    │   └── ScoreSystem.test.js
    └── services/
        ├── PlayerService.test.js
        └── RankingService.test.js
```

---

## Task 1: Project Setup

**Files:** `package.json`, `vite.config.js`, `vitest.config.js`, `index.html`, `src/main.js`, `src/config/game.js`, `src/config/supabase.js`, `.env.local`

- [ ] **Step 1: Initialize project**

```bash
cd "c:\Users\Marcos Santos\Desktop\JogoBrothers"
npm init -y
npm install phaser @supabase/supabase-js
npm install -D vite vitest
```

- [ ] **Step 2: Create `vite.config.js`**

```js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: { outDir: 'dist' },
  server: { port: 3000 },
});
```

- [ ] **Step 3: Create `vitest.config.js`**

```js
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
});
```

- [ ] **Step 4: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <title>Brothers Burger — O Jogo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; overflow: hidden; display: flex; justify-content: center; align-items: center; height: 100vh; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create `src/config/game.js`**

```js
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
```

- [ ] **Step 6: Create `.env.local`**

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Replace with actual values from the Supabase project dashboard.

- [ ] **Step 7: Create `src/config/supabase.js`**

```js
// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

- [ ] **Step 8: Create `src/main.js` (minimal — scenes added later)**

```js
// src/main.js
import Phaser from 'phaser';
import { GAME_W, GAME_H } from './config/game.js';
import { BootScene } from './scenes/BootScene.js';
import { CadastroScene } from './scenes/CadastroScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { SelectCharScene } from './scenes/SelectCharScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { RankingScene } from './scenes/RankingScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [BootScene, CadastroScene, MenuScene, SelectCharScene, GameScene, GameOverScene, RankingScene],
});
```

- [ ] **Step 9: Add scripts to `package.json`**

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run"
}
```

- [ ] **Step 10: Run dev server and verify blank canvas loads**

```bash
npm run dev
```

Expected: browser opens at `http://localhost:3000`, black screen (no scenes yet), no console errors.

- [ ] **Step 11: Commit**

```bash
git init
git add package.json vite.config.js vitest.config.js index.html src/main.js src/config/game.js src/config/supabase.js
git commit -m "feat: project setup — Phaser + Vite + Supabase config"
```

---

## Task 2: Supabase Schema

**Files:** `supabase/schema.sql`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com, create a new project. Copy the URL and anon key into `.env.local`.

- [ ] **Step 2: Create `supabase/schema.sql`**

```sql
-- jogadores
create table jogadores (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  sobrenome  text not null,
  telefone   text not null,
  criado_em  timestamptz default now()
);

-- pontuacoes
create table pontuacoes (
  id          uuid primary key default gen_random_uuid(),
  jogador_id  uuid references jogadores(id) not null,
  score       integer not null,
  personagem  smallint not null check (personagem in (1, 2)),
  criado_em   timestamptz default now()
);

-- RLS — allow anonymous read/write (game uses anon key)
alter table jogadores  enable row level security;
alter table pontuacoes enable row level security;

create policy "anon_insert_jogadores" on jogadores  for insert with check (true);
create policy "anon_read_jogadores"   on jogadores  for select using (true);
create policy "anon_insert_scores"    on pontuacoes for insert with check (true);
create policy "anon_read_scores"      on pontuacoes for select using (true);
```

- [ ] **Step 3: Run SQL in Supabase SQL Editor**

Paste the SQL above into the Supabase dashboard → SQL Editor → Run.

- [ ] **Step 4: Verify tables in Supabase Table Editor**

Both `jogadores` and `pontuacoes` should appear with correct columns.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: supabase schema — jogadores and pontuacoes tables with RLS"
```

---

## Task 3: PowerUpSystem (TDD)

**Files:** `src/systems/PowerUpSystem.js`, `tests/systems/PowerUpSystem.test.js`

- [ ] **Step 1: Write failing tests**

```js
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
```

- [ ] **Step 2: Run — verify all fail**

```bash
npm test -- tests/systems/PowerUpSystem.test.js
```

Expected: all tests FAIL with "Cannot find module".

- [ ] **Step 3: Implement `src/systems/PowerUpSystem.js`**

```js
// src/systems/PowerUpSystem.js
import { PLAYER_STATE } from '../config/game.js';

export class PowerUpSystem {
  constructor() {
    this.state = PLAYER_STATE.SMALL;
    this._invincible = false;
    this._invincibilityTimer = null;
  }

  applyMushroom() {
    if (this.state === PLAYER_STATE.SMALL) this.state = PLAYER_STATE.GIANT;
  }

  applyPotato() {
    if (this.state === PLAYER_STATE.GIANT || this.state === PLAYER_STATE.THROWER) {
      this.state = PLAYER_STATE.THROWER;
    }
  }

  applyDamage() {
    if (this.state === PLAYER_STATE.THROWER) { this.state = PLAYER_STATE.GIANT; return false; }
    if (this.state === PLAYER_STATE.GIANT)   { this.state = PLAYER_STATE.SMALL; return false; }
    return true; // SMALL → died
  }

  activateInvincibility(ms = 10000) {
    this._invincible = true;
    clearTimeout(this._invincibilityTimer);
    this._invincibilityTimer = setTimeout(() => { this._invincible = false; }, ms);
  }

  isInvincible() { return this._invincible; }
  canThrow()     { return this.state === PLAYER_STATE.THROWER; }

  reset() {
    this.state = PLAYER_STATE.SMALL;
    this._invincible = false;
    clearTimeout(this._invincibilityTimer);
  }
}
```

- [ ] **Step 4: Run — verify all pass**

```bash
npm test -- tests/systems/PowerUpSystem.test.js
```

Expected: 12 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/systems/PowerUpSystem.js tests/systems/PowerUpSystem.test.js
git commit -m "feat: PowerUpSystem — small/giant/thrower state machine with TDD"
```

---

## Task 4: CollectibleSystem (TDD)

**Files:** `src/systems/CollectibleSystem.js`, `tests/systems/CollectibleSystem.test.js`

- [ ] **Step 1: Write failing tests**

```js
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
```

- [ ] **Step 2: Run — verify all fail**

```bash
npm test -- tests/systems/CollectibleSystem.test.js
```

- [ ] **Step 3: Implement `src/systems/CollectibleSystem.js`**

```js
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

  hasIngredient(type)       { return this._collected.has(type); }
  getCollected()            { return [...this._collected]; }

  reset() {
    this.score = 0;
    this._collected = new Set();
  }
}
```

- [ ] **Step 4: Run — verify all pass**

```bash
npm test -- tests/systems/CollectibleSystem.test.js
```

Expected: 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/systems/CollectibleSystem.js tests/systems/CollectibleSystem.test.js
git commit -m "feat: CollectibleSystem — ingredient tracking and burger bonus with TDD"
```

---

## Task 5: ScoreSystem (TDD)

**Files:** `src/systems/ScoreSystem.js`, `tests/systems/ScoreSystem.test.js`

- [ ] **Step 1: Write failing tests**

```js
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
```

- [ ] **Step 2: Run — verify all fail**

```bash
npm test -- tests/systems/ScoreSystem.test.js
```

- [ ] **Step 3: Implement `src/systems/ScoreSystem.js`**

```js
// src/systems/ScoreSystem.js
import { SCORE } from '../config/game.js';

export class ScoreSystem {
  constructor() { this.total = 0; }
  add(pts)              { this.total += pts; }
  addBurgerBonus(hasAll){ if (hasAll) this.total += SCORE.BURGER_BONUS; }
  reset()               { this.total = 0; }
}
```

- [ ] **Step 4: Run — verify all pass**

```bash
npm test -- tests/systems/ScoreSystem.test.js
```

- [ ] **Step 5: Commit**

```bash
git add src/systems/ScoreSystem.js tests/systems/ScoreSystem.test.js
git commit -m "feat: ScoreSystem with TDD"
```

---

## Task 6: PlayerService + RankingService (TDD with mocks)

**Files:** `src/services/PlayerService.js`, `src/services/RankingService.js`, `tests/services/PlayerService.test.js`, `tests/services/RankingService.test.js`

- [ ] **Step 1: Write PlayerService tests**

```js
// tests/services/PlayerService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/config/supabase.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../../src/config/supabase.js';
import { PlayerService } from '../../src/services/PlayerService.js';

describe('PlayerService', () => {
  let svc;
  beforeEach(() => {
    svc = new PlayerService();
    vi.clearAllMocks();
  });

  it('create() returns player data', async () => {
    const mockPlayer = { id: 'abc', nome: 'João', sobrenome: 'Silva', telefone: '11999999999' };
    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockPlayer, error: null }),
        }),
      }),
    });

    const result = await svc.create('João', 'Silva', '11999999999');
    expect(result).toEqual(mockPlayer);
  });

  it('create() throws on error', async () => {
    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
        }),
      }),
    });

    await expect(svc.create('João', 'Silva', '11999')).rejects.toThrow('DB error');
  });
});
```

- [ ] **Step 2: Implement `src/services/PlayerService.js`**

```js
// src/services/PlayerService.js
import { supabase } from '../config/supabase.js';

export class PlayerService {
  async create(nome, sobrenome, telefone) {
    const { data, error } = await supabase
      .from('jogadores')
      .insert({ nome, sobrenome, telefone })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
```

- [ ] **Step 3: Write RankingService tests**

```js
// tests/services/RankingService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/config/supabase.js', () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from '../../src/config/supabase.js';
import { RankingService } from '../../src/services/RankingService.js';

describe('RankingService', () => {
  let svc;
  beforeEach(() => { svc = new RankingService(); vi.clearAllMocks(); });

  it('saveScore() inserts and returns row', async () => {
    const row = { id: '1', jogador_id: 'abc', score: 1500, personagem: 1 };
    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: row, error: null }),
        }),
      }),
    });
    const result = await svc.saveScore('abc', 1500, 1);
    expect(result.score).toBe(1500);
  });

  it('getTopTen() returns ranked list', async () => {
    const rows = [
      { score: 2000, jogadores: { nome: 'Ana', sobrenome: 'Lima' } },
      { score: 1000, jogadores: { nome: 'Bob', sobrenome: 'Cruz' } },
      { score: 1500, jogadores: { nome: 'Ana', sobrenome: 'Lima' } }, // duplicate, lower
    ];
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
        }),
      }),
    });
    const top = await svc.getTopTen();
    expect(top[0].name).toBe('Ana Lima');
    expect(top[0].score).toBe(2000); // highest for Ana
    expect(top).toHaveLength(2);
  });
});
```

- [ ] **Step 4: Implement `src/services/RankingService.js`**

```js
// src/services/RankingService.js
import { supabase } from '../config/supabase.js';

export class RankingService {
  async saveScore(jogadorId, score, personagem) {
    const { data, error } = await supabase
      .from('pontuacoes')
      .insert({ jogador_id: jogadorId, score, personagem })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getTopTen() {
    const { data, error } = await supabase
      .from('pontuacoes')
      .select('score, jogadores(nome, sobrenome)')
      .order('score', { ascending: false })
      .limit(200);
    if (error) throw error;

    const best = {};
    for (const row of data) {
      const key = `${row.jogadores.nome} ${row.jogadores.sobrenome}`;
      if (!best[key] || best[key] < row.score) best[key] = row.score;
    }
    return Object.entries(best)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  async getPlayerBestScore(jogadorId) {
    const { data, error } = await supabase
      .from('pontuacoes')
      .select('score')
      .eq('jogador_id', jogadorId)
      .order('score', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) return 0;
    return data.score;
  }

  async getPlayerRank(jogadorId) {
    const { data, error } = await supabase
      .from('pontuacoes')
      .select('score, jogador_id')
      .order('score', { ascending: false });
    if (error) return null;
    const best = {};
    for (const row of data) {
      if (!best[row.jogador_id] || best[row.jogador_id] < row.score)
        best[row.jogador_id] = row.score;
    }
    const sorted = Object.keys(best).sort((a, b) => best[b] - best[a]);
    const idx = sorted.indexOf(jogadorId);
    return idx === -1 ? null : idx + 1;
  }
}
```

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/services/ tests/services/
git commit -m "feat: PlayerService and RankingService with TDD"
```

---

## Task 7: BootScene + CadastroScene

**Files:** `src/scenes/BootScene.js`, `src/scenes/CadastroScene.js`

- [ ] **Step 1: Create `src/scenes/BootScene.js`**

```js
// src/scenes/BootScene.js
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    // ⚠️ Replace file paths with actual designer assets when available.
    // Use placeholder colored rectangles during development.
    this.load.image('logo', 'assets/sprites/ui.png');
    this.load.spritesheet('char1', 'assets/sprites/char1.png', { frameWidth: 16, frameHeight: 24 });
    this.load.spritesheet('char2', 'assets/sprites/char2.png', { frameWidth: 16, frameHeight: 24 });
    this.load.spritesheet('enemies', 'assets/sprites/enemies.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('bosses', 'assets/sprites/bosses.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('powerups', 'assets/sprites/powerups.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('collectibles', 'assets/sprites/collectibles.png', { frameWidth: 16, frameHeight: 16 });
    this.load.tilemapTiledJSON('fase1', 'assets/tilemaps/fase1.json');
    this.load.tilemapTiledJSON('fase2', 'assets/tilemaps/fase2.json');
    this.load.tilemapTiledJSON('fase3', 'assets/tilemaps/fase3.json');
    this.load.tilemapTiledJSON('fase4', 'assets/tilemaps/fase4.json');
    this.load.image('cozinha', 'assets/tilesets/cozinha.png');
    this.load.image('rua', 'assets/tilesets/rua.png');
    this.load.image('mercado', 'assets/tilesets/mercado.png');
    this.load.image('restaurante', 'assets/tilesets/restaurante.png');
    this.load.audio('fase1', 'assets/audio/fase1.mp3');
    this.load.audio('fase2', 'assets/audio/fase2.mp3');
    this.load.audio('fase3', 'assets/audio/fase3.mp3');
    this.load.audio('fase4', 'assets/audio/fase4.mp3');
    this.load.audio('boss', 'assets/audio/boss.mp3');
    this.load.audio('sfx_jump', 'assets/audio/sfx/jump.mp3');
    this.load.audio('sfx_collect', 'assets/audio/sfx/collect.mp3');
    this.load.audio('sfx_powerup', 'assets/audio/sfx/powerup.mp3');
    this.load.audio('sfx_damage', 'assets/audio/sfx/damage.mp3');
    this.load.audio('sfx_defeat', 'assets/audio/sfx/defeat.mp3');
  }

  create() {
    const playerId = localStorage.getItem('bb_player_id');
    if (playerId) {
      this.scene.start('MenuScene', { playerId });
    } else {
      this.scene.start('CadastroScene');
    }
  }
}
```

- [ ] **Step 2: Create `src/scenes/CadastroScene.js`**

```js
// src/scenes/CadastroScene.js
import Phaser from 'phaser';
import { PlayerService } from '../services/PlayerService.js';
import { GAME_W, GAME_H } from '../config/game.js';

export class CadastroScene extends Phaser.Scene {
  constructor() { super('CadastroScene'); }

  create() {
    const svc = new PlayerService();
    const cx = GAME_W / 2;

    this.add.text(cx, 60, 'BROTHERS BURGER', { fontSize: '28px', fill: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(cx, 100, 'Cadastre-se para jogar!', { fontSize: '16px', fill: '#FFF' }).setOrigin(0.5);

    const style = 'width:220px;padding:8px;font-size:16px;background:#222;color:#fff;border:2px solid #FFD700;border-radius:6px;';
    const nomeEl      = this.add.dom(cx, 170).createElement('input').setAttr('placeholder', 'Nome').setAttr('style', style);
    const sobrenomeEl = this.add.dom(cx, 220).createElement('input').setAttr('placeholder', 'Sobrenome').setAttr('style', style);
    const telEl       = this.add.dom(cx, 270).createElement('input').setAttr('placeholder', 'Telefone (11999999999)').setAttr('style', style).setAttr('type', 'tel');

    const errText = this.add.text(cx, 310, '', { fontSize: '13px', fill: '#FF4444' }).setOrigin(0.5);

    const btn = this.add.text(cx, 350, '[ JOGAR ]', { fontSize: '22px', fill: '#FFD700', fontStyle: 'bold' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', async () => {
      const nome      = nomeEl.node.value.trim();
      const sobrenome = sobrenomeEl.node.value.trim();
      const telefone  = telEl.node.value.trim().replace(/\D/g, '');

      if (!nome || !sobrenome) { errText.setText('Preencha nome e sobrenome.'); return; }
      if (telefone.length < 10) { errText.setText('Telefone inválido.'); return; }

      btn.setText('Aguarde...').setInteractive(false);
      try {
        const player = await svc.create(nome, sobrenome, telefone);
        localStorage.setItem('bb_player_id', player.id);
        localStorage.setItem('bb_player_name', `${player.nome} ${player.sobrenome}`);
        this.scene.start('MenuScene', { playerId: player.id });
      } catch (e) {
        errText.setText('Erro ao cadastrar. Tente novamente.');
        btn.setText('[ JOGAR ]').setInteractive(true);
      }
    });
  }
}
```

- [ ] **Step 3: Enable DOM in Phaser config (`src/main.js`)**

Add `dom: { createContainer: true }` to the Phaser.Game config object:

```js
new Phaser.Game({
  // ... existing config
  dom: { createContainer: true },
  // ...
});
```

- [ ] **Step 4: Start dev server and verify cadastro form appears**

```bash
npm run dev
```

Open browser. Should see "BROTHERS BURGER" text, three input fields, and JOGAR button.

- [ ] **Step 5: Commit**

```bash
git add src/scenes/BootScene.js src/scenes/CadastroScene.js src/main.js
git commit -m "feat: BootScene preloads assets, CadastroScene handles first-time registration"
```

---

## Task 8: MenuScene + SelectCharScene

**Files:** `src/scenes/MenuScene.js`, `src/scenes/SelectCharScene.js`

- [ ] **Step 1: Create `src/scenes/MenuScene.js`**

```js
// src/scenes/MenuScene.js
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config/game.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create({ playerId }) {
    this._playerId = playerId;
    const cx = GAME_W / 2;

    // Background color — replace with background image when asset is ready
    this.add.rectangle(cx, GAME_H / 2, GAME_W, GAME_H, 0x1a0a00);

    this.add.text(cx, 100, 'BROTHERS BURGER', { fontSize: '36px', fill: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(cx, 145, 'O JOGO', { fontSize: '20px', fill: '#FFA500' }).setOrigin(0.5);

    const playerName = localStorage.getItem('bb_player_name') || '';
    this.add.text(cx, 200, `Olá, ${playerName}!`, { fontSize: '15px', fill: '#FFF' }).setOrigin(0.5);

    this._makeBtn(cx, 280, 'JOGAR', () => this.scene.start('SelectCharScene', { playerId }));
    this._makeBtn(cx, 340, 'RANKING', () => this.scene.start('RankingScene', { playerId }));
  }

  _makeBtn(x, y, label, cb) {
    const btn = this.add.text(x, y, `[ ${label} ]`, { fontSize: '24px', fill: '#FFD700', fontStyle: 'bold' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setFill('#FFF'));
    btn.on('pointerout',  () => btn.setFill('#FFD700'));
    btn.on('pointerdown', cb);
    return btn;
  }
}
```

- [ ] **Step 2: Create `src/scenes/SelectCharScene.js`**

```js
// src/scenes/SelectCharScene.js
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config/game.js';

export class SelectCharScene extends Phaser.Scene {
  constructor() { super('SelectCharScene'); }

  create({ playerId }) {
    const cx = GAME_W / 2;
    this.add.rectangle(cx, GAME_H / 2, GAME_W, GAME_H, 0x1a0a00);
    this.add.text(cx, 60, 'ESCOLHA SEU PERSONAGEM', { fontSize: '22px', fill: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5);

    // Character 1
    const c1 = this.add.sprite(cx - 150, 220, 'char1', 0).setScale(4).setInteractive({ useHandCursor: true });
    this.add.text(cx - 150, 300, 'CHAR 1', { fontSize: '16px', fill: '#FFF' }).setOrigin(0.5);

    // Character 2
    const c2 = this.add.sprite(cx + 150, 220, 'char2', 0).setScale(4).setInteractive({ useHandCursor: true });
    this.add.text(cx + 150, 300, 'CHAR 2', { fontSize: '16px', fill: '#FFF' }).setOrigin(0.5);

    [c1, c2].forEach((sprite, idx) => {
      sprite.on('pointerover', () => sprite.setTint(0xFFD700));
      sprite.on('pointerout',  () => sprite.clearTint());
      sprite.on('pointerdown', () => {
        this.scene.start('GameScene', { playerId, character: idx + 1, phase: 1 });
      });
    });

    this.add.text(cx, 400, '← VOLTAR', { fontSize: '16px', fill: '#888' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MenuScene', { playerId }));
  }
}
```

- [ ] **Step 3: Test in browser — verify menu and character select navigate correctly**

```bash
npm run dev
```

Register once → see menu → click JOGAR → see character selection → click a character (GameScene not built yet, will error — that's fine).

- [ ] **Step 4: Commit**

```bash
git add src/scenes/MenuScene.js src/scenes/SelectCharScene.js
git commit -m "feat: MenuScene and SelectCharScene"
```

---

## Task 9: ControlsSystem (Virtual Joystick + Buttons)

**Files:** `src/systems/ControlsSystem.js`

- [ ] **Step 1: Create `src/systems/ControlsSystem.js`**

```js
// src/systems/ControlsSystem.js
import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config/game.js';

// Builds virtual SNES-style controls over the game canvas.
// Exposes a `state` object read each frame by Player.update().
export class ControlsSystem {
  constructor(scene) {
    this.scene = scene;
    this.state = { left: false, right: false, down: false, jump: false, run: false, spinJump: false, throwPotato: false };

    this._joystickZone = null;
    this._joystickBase = null;
    this._joystickThumb = null;
    this._joystickId = null;
    this._joystickOrigin = { x: 0, y: 0 };

    this._btns = {};
    this._buildJoystick();
    this._buildButtons();
  }

  _buildJoystick() {
    const bx = 90, by = GAME_H - 90, r = 60;
    this._joystickBase  = this.scene.add.circle(bx, by, r, 0xffffff, 0.15).setDepth(10);
    this._joystickThumb = this.scene.add.circle(bx, by, 25, 0xffffff, 0.4).setDepth(11);

    const zone = this.scene.add.zone(bx, by, r * 2, r * 2).setInteractive().setDepth(12);
    zone.on('pointerdown', (p) => {
      this._joystickId = p.id;
      this._joystickOrigin = { x: p.x, y: p.y };
    });
    this.scene.input.on('pointermove', (p) => {
      if (p.id !== this._joystickId) return;
      const dx = p.x - this._joystickOrigin.x;
      const dy = p.y - this._joystickOrigin.y;
      const dist = Math.min(Math.sqrt(dx*dx + dy*dy), r);
      const angle = Math.atan2(dy, dx);
      this._joystickThumb.setPosition(
        this._joystickBase.x + Math.cos(angle) * dist,
        this._joystickBase.y + Math.sin(angle) * dist
      );
      const threshold = 15;
      this.state.left  = dx < -threshold;
      this.state.right = dx > threshold;
      this.state.down  = dy > threshold;
    });
    this.scene.input.on('pointerup', (p) => {
      if (p.id !== this._joystickId) return;
      this._joystickId = null;
      this._joystickThumb.setPosition(this._joystickBase.x, this._joystickBase.y);
      this.state.left = this.state.right = this.state.down = false;
    });
  }

  // SNES layout: B bottom-center, A right, X top-center, Y left
  _buildButtons() {
    const rx = GAME_W - 90, ry = GAME_H - 90, gap = 38;
    const defs = [
      { key: 'jump',        label: 'B', x: rx,        y: ry,        color: 0x4444ff },
      { key: 'throwPotato', label: 'A', x: rx + gap,  y: ry - gap,  color: 0xff4444 },
      { key: 'run',         label: 'X', x: rx,        y: ry - gap*2, color: 0xaaaaff },
      { key: 'spinJump',    label: 'Y', x: rx - gap,  y: ry - gap,  color: 0xffaa00 },
    ];

    for (const def of defs) {
      const circle = this.scene.add.circle(def.x, def.y, 22, def.color, 0.7).setDepth(10).setInteractive();
      this.scene.add.text(def.x, def.y, def.label, { fontSize: '14px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(11);
      circle.on('pointerdown', () => { this.state[def.key] = true; });
      this.scene.input.on('pointerup',   () => { this.state[def.key] = false; });
    }
  }

  destroy() {
    this._joystickBase.destroy();
    this._joystickThumb.destroy();
    Object.values(this._btns).forEach(b => b.destroy());
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/systems/ControlsSystem.js
git commit -m "feat: ControlsSystem — virtual SNES joystick and buttons"
```

---

## Task 10: Player Entity

**Files:** `src/entities/Player.js`, `src/entities/Potato.js`

- [ ] **Step 1: Create `src/entities/Potato.js`**

```js
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
    scene.time.delayedCall(2500, () => this.destroy());
  }
}
```

- [ ] **Step 2: Create `src/entities/Player.js`**

```js
// src/entities/Player.js
import Phaser from 'phaser';
import { PowerUpSystem } from '../systems/PowerUpSystem.js';
import { Potato } from './Potato.js';
import { PHYSICS, PLAYER_STATE, LIVES, INVINCIBILITY_MS } from '../config/game.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, character) {
    const key = character === 1 ? 'char1' : 'char2';
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.powerUpSystem = new PowerUpSystem();
    this.lives = LIVES;
    this.character = character;
    this._key = key;
    this._dirX = 1; // facing right

    this.setCollideWorldBounds(true);
    this.setGravityY(PHYSICS.GRAVITY);
    this._applyBodySize();
    this._buildAnims(scene, key);
  }

  _applyBodySize() {
    if (this.powerUpSystem.state === PLAYER_STATE.SMALL) {
      this.setScale(2); this.body.setSize(12, 20);
    } else {
      this.setScale(3); this.body.setSize(12, 22);
    }
  }

  _buildAnims(scene, key) {
    const anims = scene.anims;
    const makeAnim = (animKey, frames, rate, repeat = -1) => {
      if (!anims.exists(animKey)) {
        anims.create({ key: animKey, frames: anims.generateFrameNumbers(key, { frames }), frameRate: rate, repeat });
      }
    };
    makeAnim(`${key}_idle`,  [0],       4);
    makeAnim(`${key}_walk`,  [1,2,3,4], 10);
    makeAnim(`${key}_jump`,  [5],       4);
    makeAnim(`${key}_spin`,  [6,7],     12);
    makeAnim(`${key}_big_idle`, [8],       4);
    makeAnim(`${key}_big_walk`, [9,10,11], 10);
  }

  update(ctrl) {
    const onGround = this.body.blocked.down;
    const speed = ctrl.run ? PHYSICS.RUN_SPEED : PHYSICS.SPEED;
    const isBig = this.powerUpSystem.state !== PLAYER_STATE.SMALL;
    const prefix = `${this._key}${isBig ? '_big' : ''}`;

    if (ctrl.left)  { this.setVelocityX(-speed); this.setFlipX(true);  this._dirX = -1; this.anims.play(`${prefix}_walk`, true); }
    else if (ctrl.right) { this.setVelocityX(speed); this.setFlipX(false); this._dirX = 1;  this.anims.play(`${prefix}_walk`, true); }
    else { this.setVelocityX(0); if (onGround) this.anims.play(`${prefix}_idle`, true); }

    if (ctrl.jump && onGround)     { this.setVelocityY(PHYSICS.JUMP_VY);      this.anims.play(`${this._key}_jump`, true); }
    if (ctrl.spinJump && onGround) { this.setVelocityY(PHYSICS.SPIN_JUMP_VY); this.anims.play(`${this._key}_spin`, true); }

    if (ctrl.throwPotato) this.throwPotato();
  }

  throwPotato() {
    if (!this.powerUpSystem.canThrow()) return null;
    const potato = new Potato(this.scene, this.x + this._dirX * 20, this.y, this._dirX);
    this.scene.events.emit('potato_thrown', potato);
    return potato;
  }

  applyMushroom() {
    this.powerUpSystem.applyMushroom();
    this._applyBodySize();
    this.scene.sound.play('sfx_powerup');
  }

  applyPotato() {
    this.powerUpSystem.applyPotato();
    this.scene.sound.play('sfx_powerup');
  }

  activateInvincibility() {
    this.powerUpSystem.activateInvincibility(INVINCIBILITY_MS);
    // Flash effect
    this.scene.tweens.add({ targets: this, alpha: 0.3, duration: 80, yoyo: true, repeat: 60,
      onComplete: () => this.setAlpha(1) });
  }

  takeDamage() {
    if (this.powerUpSystem.isInvincible()) return 'invincible';
    const died = this.powerUpSystem.applyDamage();
    this._applyBodySize();
    this.scene.sound.play('sfx_damage');
    if (died) {
      this.lives--;
      return this.lives <= 0 ? 'game_over' : 'life_lost';
    }
    // Invincibility frames after damage
    this.powerUpSystem._invincible = true;
    this.scene.tweens.add({ targets: this, alpha: 0.3, duration: 100, yoyo: true, repeat: 8,
      onComplete: () => { this.setAlpha(1); this.powerUpSystem._invincible = false; } });
    return 'damaged';
  }

  isSpinJumping() {
    return this.anims.currentAnim?.key.includes('spin') && !this.body.blocked.down;
  }

  reset(x, y) {
    this.setPosition(x, y);
    this.powerUpSystem.reset();
    this._applyBodySize();
    this.setAlpha(1);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/entities/Player.js src/entities/Potato.js
git commit -m "feat: Player entity with power-up state and virtual control integration"
```

---

## Task 11: Enemy Classes

**Files:** `src/entities/enemies/BaseEnemy.js`, `Picles.js`, `Cebola.js`, `Mosca.js`, `Refrigerante.js`

- [ ] **Step 1: Create `src/entities/enemies/BaseEnemy.js`**

```js
// src/entities/enemies/BaseEnemy.js
import Phaser from 'phaser';

export class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, frame) {
    super(scene, x, y, 'enemies', frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.hp = 1;
    this.setCollideWorldBounds(true);
    this.setGravityY(400);
  }

  // Returns true if enemy is defeated
  hit(isSpin = false) {
    this.hp--;
    if (this.hp <= 0) {
      this.scene.sound.play('sfx_defeat');
      this.destroy();
      return true;
    }
    return false;
  }

  // Called if player walks into enemy (not stomping) → damage player
  touchPlayer(player) {
    if (player.powerUpSystem.isInvincible()) {
      this.hit();
      return;
    }
    player.takeDamage();
  }
}
```

- [ ] **Step 2: Create `src/entities/enemies/Picles.js`**

```js
// src/entities/enemies/Picles.js
// Walks left/right, leaves slowing slime trail.
import { BaseEnemy } from './BaseEnemy.js';

export class Picles extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, 0); // frame 0 in enemies spritesheet
    this.setVelocityX(-60);
    this._slimeTiles = [];
  }

  update() {
    if (this.body.blocked.right) this.setVelocityX(-60);
    if (this.body.blocked.left)  this.setVelocityX(60);

    // Spawn slime particle every 30 frames
    this._slimeTimer = (this._slimeTimer || 0) + 1;
    if (this._slimeTimer % 30 === 0) {
      const slime = this.scene.add.rectangle(this.x, this.y + 12, 16, 8, 0x44ff44, 0.5);
      this.scene.time.delayedCall(3000, () => slime.destroy());
    }
  }
}
```

- [ ] **Step 3: Create `src/entities/enemies/Cebola.js`**

```js
// src/entities/enemies/Cebola.js
// Shoots acid mist that temporarily scrambles controls.
import { BaseEnemy } from './BaseEnemy.js';

export class Cebola extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, 1); // frame 1
    this.setVelocityX(-40);
    this._shootCooldown = 0;
  }

  update(player) {
    if (this.body.blocked.right) this.setVelocityX(-40);
    if (this.body.blocked.left)  this.setVelocityX(40);

    this._shootCooldown--;
    if (this._shootCooldown <= 0 && Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) < 200) {
      this._shoot(player);
      this._shootCooldown = 180;
    }
  }

  _shoot(player) {
    const mist = this.scene.add.rectangle(
      (this.x + player.x) / 2, this.y, 32, 32, 0xaa44aa, 0.3
    );
    this.scene.time.delayedCall(800, () => {
      if (mist.active) {
        // Scramble controls for 3 seconds
        player._controlsScrambled = true;
        this.scene.time.delayedCall(3000, () => { player._controlsScrambled = false; });
        mist.destroy();
      }
    });
  }
}
```

- [ ] **Step 4: Create `src/entities/enemies/Mosca.js`**

```js
// src/entities/enemies/Mosca.js
// Flies in random sine-wave pattern.
import { BaseEnemy } from './BaseEnemy.js';

export class Mosca extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, 2); // frame 2
    this.body.setAllowGravity(false);
    this._baseY = y;
    this._t = Math.random() * Math.PI * 2;
    this.setVelocityX(Phaser.Math.Between(-80, 80) || 60);
  }

  update() {
    this._t += 0.05;
    this.y = this._baseY + Math.sin(this._t) * 40;
    if (this.body.blocked.right) this.setVelocityX(-80);
    if (this.body.blocked.left)  this.setVelocityX(80);
  }
}
```

- [ ] **Step 5: Create `src/entities/enemies/Refrigerante.js`**

```js
// src/entities/enemies/Refrigerante.js
// Stationary. Explodes when player is within 80px, damaging player.
import { BaseEnemy } from './BaseEnemy.js';

export class Refrigerante extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, y, 3); // frame 3
    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
    this._exploding = false;
  }

  update(player) {
    if (this._exploding) return;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist < 80) this._explode(player);
  }

  _explode(player) {
    this._exploding = true;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(500, () => {
      if (!player.powerUpSystem.isInvincible()) player.takeDamage();
      this.destroy();
    });
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/entities/enemies/
git commit -m "feat: enemy classes — Picles, Cebola, Mosca, Refrigerante"
```

---

## Task 12: HUDSystem

**Files:** `src/systems/HUDSystem.js`

- [ ] **Step 1: Create `src/systems/HUDSystem.js`**

```js
// src/systems/HUDSystem.js
import { GAME_W, PLAYER_STATE } from '../config/game.js';

export class HUDSystem {
  constructor(scene) {
    this.scene = scene;
    const depth = 20;
    this._livesText  = scene.add.text(12, 8,  'VIDAS: 3',  { fontSize: '14px', fill: '#FFF' }).setDepth(depth).setScrollFactor(0);
    this._scoreText  = scene.add.text(12, 26, 'SCORE: 0',  { fontSize: '14px', fill: '#FFD700' }).setDepth(depth).setScrollFactor(0);
    this._powerText  = scene.add.text(12, 44, '',           { fontSize: '12px', fill: '#44FF44' }).setDepth(depth).setScrollFactor(0);
    this._logo       = scene.add.text(GAME_W - 10, 8, 'BROTHERS\nBURGER', { fontSize: '10px', fill: '#FFD700', align: 'right' }).setOrigin(1, 0).setDepth(depth).setScrollFactor(0);
  }

  update(lives, score, powerUpState) {
    this._livesText.setText(`VIDAS: ${lives}`);
    this._scoreText.setText(`SCORE: ${score}`);
    const labels = { [PLAYER_STATE.SMALL]: '', [PLAYER_STATE.GIANT]: '★ GIGANTE', [PLAYER_STATE.THROWER]: '★ BATATA' };
    this._powerText.setText(labels[powerUpState] || '');
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/systems/HUDSystem.js
git commit -m "feat: HUDSystem — lives, score, power-up indicator"
```

---

## Task 13: GameScene (Core Loop)

**Files:** `src/scenes/GameScene.js`

This scene is shared by all 4 phases. It receives `{ playerId, character, phase }` as data.

- [ ] **Step 1: Create `src/scenes/GameScene.js`**

```js
// src/scenes/GameScene.js
import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { ControlsSystem } from '../systems/ControlsSystem.js';
import { CollectibleSystem } from '../systems/CollectibleSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { HUDSystem } from '../systems/HUDSystem.js';
import { Picles } from '../entities/enemies/Picles.js';
import { Cebola } from '../entities/enemies/Cebola.js';
import { Mosca } from '../entities/enemies/Mosca.js';
import { Refrigerante } from '../entities/enemies/Refrigerante.js';
import { HamburgerMonstro } from '../entities/bosses/HamburgerMonstro.js';
import { Gordao } from '../entities/bosses/Gordao.js';
import { GAME_W, GAME_H, PHASES, INGREDIENTS } from '../config/game.js';
import { RankingService } from '../services/RankingService.js';

const ENEMY_CLASSES = { Picles, Cebola, Mosca, Refrigerante };

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this._playerId  = data.playerId;
    this._character = data.character;
    this._phase     = data.phase;
    this._score     = data.score || 0;       // accumulated across phases
    this._collected = data.collected || [];  // ingredients collected so far
  }

  create() {
    const cfg = PHASES[this._phase];
    this._collectibleSys = new CollectibleSystem();
    this._scoreSys       = new ScoreSystem();
    this._scoreSys.add(this._score); // restore cross-phase score

    // Restore previously collected ingredients
    this._collected.forEach(i => this._collectibleSys.collectIngredient(i));

    // Tilemap
    const map     = this.make.tilemap({ key: cfg.tilemap });
    const tileset = map.addTilesetImage(cfg.tileset, cfg.tileset);
    this._ground  = map.createLayer('ground', tileset, 0, 0);
    this._ground.setCollisionByProperty({ collides: true });
    const worldW  = map.widthInPixels;
    this.physics.world.setBounds(0, 0, worldW, GAME_H);
    this.cameras.main.setBounds(0, 0, worldW, GAME_H);

    // Player spawn from tilemap object layer
    const spawnObj = map.findObject('objects', o => o.name === 'spawn');
    this._player = new Player(this, spawnObj?.x || 60, spawnObj?.y || GAME_H - 80, this._character);
    this.cameras.main.startFollow(this._player, true, 0.1, 0.1);

    // Physics
    this.physics.add.collider(this._player, this._ground);

    // Enemies from object layer
    this._enemies = this.physics.add.group();
    this._potatoes = this.physics.add.group();
    this._spawnEnemiesFromMap(map);

    // Collectibles from object layer
    this._collectibles = this.physics.add.staticGroup();
    this._spawnCollectiblesFromMap(map);
    this._spawnPowerUpsFromMap(map);

    // Boss (end of phase)
    this._boss = null;
    if (cfg.boss) this._spawnBoss(map, cfg.boss);

    // Player vs enemy overlap
    this.physics.add.overlap(this._player, this._enemies, (player, enemy) => {
      if (player.isSpinJumping() || player.powerUpSystem.isInvincible()) {
        enemy.hit(true);
        player.setVelocityY(-200);
      } else {
        enemy.touchPlayer(player);
      }
    });

    // Potato vs enemy
    this.physics.add.overlap(this._potatoes, this._enemies, (potato, enemy) => {
      potato.destroy();
      enemy.hit();
    });

    // Player vs collectibles
    this.physics.add.overlap(this._player, this._collectibles, (player, item) => {
      this._onCollect(item);
    });

    // Listen for potato throws
    this.events.on('potato_thrown', (potato) => {
      this._potatoes.add(potato);
      this.physics.add.collider(potato, this._ground, () => potato.destroy());
    });

    // Systems
    this._controls = new ControlsSystem(this);
    this._hud      = new HUDSystem(this);

    // Music
    this._music = this.sound.add(cfg.music, { loop: true, volume: 0.5 });
    this._music.play();

    // Goal trigger (end of phase)
    const goalObj = map.findObject('objects', o => o.name === 'goal');
    if (goalObj) {
      const goalZone = this.add.zone(goalObj.x, goalObj.y, 32, GAME_H);
      this.physics.add.existing(goalZone, true);
      this.physics.add.overlap(this._player, goalZone, () => this._completePhase());
    }
  }

  _spawnEnemiesFromMap(map) {
    const layer = map.getObjectLayer('enemies');
    if (!layer) return;
    for (const obj of layer.objects) {
      const EnemyClass = ENEMY_CLASSES[obj.name];
      if (EnemyClass) {
        const e = new EnemyClass(this, obj.x, obj.y);
        this._enemies.add(e);
        this.physics.add.collider(e, this._ground);
      }
    }
  }

  _spawnCollectiblesFromMap(map) {
    const layer = map.getObjectLayer('collectibles');
    if (!layer) return;
    const frameMap = { batata_frita: 0, pao: 1, alface: 2, tomate: 3, molho: 4, bacon: 5, hamburger: 6 };
    for (const obj of layer.objects) {
      const frame = frameMap[obj.name] ?? 0;
      const item  = this._collectibles.create(obj.x, obj.y, 'collectibles', frame);
      item.setData('type', obj.name);
    }
  }

  _spawnPowerUpsFromMap(map) {
    const layer = map.getObjectLayer('powerups');
    if (!layer) return;
    const frameMap = { cogumelo: 0, batata_crua: 1, estrela: 2 };
    for (const obj of layer.objects) {
      const frame = frameMap[obj.name] ?? 0;
      const pu    = this._collectibles.create(obj.x, obj.y, 'powerups', frame);
      pu.setData('type', `pu_${obj.name}`);
    }
  }

  _spawnBoss(map, bossKey) {
    const bossObj = map.findObject('objects', o => o.name === 'boss_spawn');
    if (!bossObj) return;
    this._boss = bossKey === 'boss1'
      ? new HamburgerMonstro(this, bossObj.x, bossObj.y)
      : new Gordao(this, bossObj.x, bossObj.y);
    this.physics.add.collider(this._boss, this._ground);
    this.physics.add.overlap(this._player, this._boss, () => {
      if (this._player.isSpinJumping() || this._player.powerUpSystem.isInvincible()) {
        const dead = this._boss.hit();
        this._player.setVelocityY(-280);
        if (dead) this._onBossDefeated();
      } else {
        this._player.takeDamage();
      }
    });
    this.physics.add.overlap(this._potatoes, this._boss, (potato) => {
      potato.destroy();
      const dead = this._boss.hit();
      if (dead) this._onBossDefeated();
    });
  }

  _onCollect(item) {
    const type = item.getData('type');
    item.destroy();
    this.sound.play('sfx_collect');

    if (type === 'batata_frita') {
      const pts = this._collectibleSys.score; this._collectibleSys.collectFries(); this._scoreSys.add(this._collectibleSys.score - pts);
    } else if (INGREDIENTS.includes(type)) {
      const pts = this._collectibleSys.score; this._collectibleSys.collectIngredient(type); this._scoreSys.add(this._collectibleSys.score - pts);
    } else if (type === 'pu_cogumelo') {
      this._player.applyMushroom();
    } else if (type === 'pu_batata_crua') {
      this._player.applyPotato();
    } else if (type === 'pu_estrela') {
      this._player.activateInvincibility();
    }
  }

  _onBossDefeated() {
    this._boss = null;
    this.time.delayedCall(1000, () => this._completePhase());
  }

  _completePhase() {
    this._music.stop();
    const bonus = this._collectibleSys.getBurgerBonus();
    this._scoreSys.addBurgerBonus(bonus > 0);

    if (this._phase < 4) {
      // Next phase — carry score and collected ingredients
      this.scene.start('GameScene', {
        playerId:  this._playerId,
        character: this._character,
        phase:     this._phase + 1,
        score:     this._scoreSys.total,
        collected: this._collectibleSys.getCollected(),
      });
    } else {
      // Game complete
      this.scene.start('GameOverScene', {
        playerId:    this._playerId,
        character:   this._character,
        score:       this._scoreSys.total,
        collected:   this._collectibleSys.getCollected(),
        burgerBonus: bonus > 0,
      });
    }
  }

  _handlePlayerDeath(result) {
    if (result === 'game_over') {
      this._music.stop();
      this.scene.start('GameOverScene', {
        playerId:    this._playerId,
        character:   this._character,
        score:       this._scoreSys.total,
        collected:   this._collectibleSys.getCollected(),
        burgerBonus: false,
      });
    } else if (result === 'life_lost') {
      this._player.reset(80, GAME_H - 80);
    }
  }

  update() {
    const ctrl = this._controls.state;

    // Scrambled controls (Cebola effect)
    const activeCtrl = this._player._controlsScrambled
      ? { ...ctrl, left: ctrl.right, right: ctrl.left }
      : ctrl;

    this._player.update(activeCtrl);

    // Update enemies
    this._enemies.getChildren().forEach(e => e.update?.(this._player));

    // Boss update
    this._boss?.update?.(this._player);

    // HUD
    this._hud.update(
      this._player.lives,
      this._scoreSys.total,
      this._player.powerUpSystem.state
    );

    // Check for player death
    if (this._player.y > GAME_H + 100) {
      const result = this._player.takeDamage();
      this._handlePlayerDeath(result);
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: GameScene — core platformer loop with tilemap, enemies, collectibles, bosses"
```

---

## Task 14: Boss Classes

**Files:** `src/entities/bosses/HamburgerMonstro.js`, `src/entities/bosses/Gordao.js`

- [ ] **Step 1: Create `src/entities/bosses/HamburgerMonstro.js`**

```js
// src/entities/bosses/HamburgerMonstro.js
// Boss 1 — end of Phase 2. Spits grease blobs at player.
import Phaser from 'phaser';

export class HamburgerMonstro extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bosses', 0); // frames 0-3 in bosses spritesheet
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.hp = 5;
    this.setScale(3);
    this.body.setImmovable(true);
    this.setCollideWorldBounds(true);
    this._shootTimer = 0;
    this._grease = scene.physics.add.group();

    // Boss health bar
    this._hpBar = scene.add.rectangle(x, y - 50, 80, 8, 0xff0000).setDepth(20).setScrollFactor(0);
    this._hpBg  = scene.add.rectangle(x, y - 50, 80, 8, 0x333333, 0.5).setDepth(19).setScrollFactor(0);
    scene.add.text(4, 4, 'BOSS', { fontSize: '12px', fill: '#FF4444' }).setDepth(21).setScrollFactor(0);
  }

  update(player) {
    this._shootTimer++;
    if (this._shootTimer % 90 === 0) this._spitGrease(player);
    // Pace left-right slowly
    if (this.body.blocked.right) this.setVelocityX(-40);
    if (this.body.blocked.left)  this.setVelocityX(40);
    if (this.body.velocity.x === 0) this.setVelocityX(-40);
  }

  _spitGrease(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    const blob = this.scene.physics.add.image(this.x, this.y - 20, 'collectibles', 7);
    blob.setVelocity((dx/len) * 200, (dy/len) * 200 - 50);
    blob.setGravityY(200);
    this._grease.add(blob);
    this.scene.time.delayedCall(3000, () => blob?.destroy());

    // Grease damages player
    this.scene.physics.add.overlap(blob, player, () => {
      if (!player.powerUpSystem.isInvincible()) player.takeDamage();
      blob.destroy();
    });
  }

  hit() {
    this.hp--;
    this.setTint(0xFF0000);
    this.scene.time.delayedCall(200, () => this.clearTint());
    this._hpBar.width = (this.hp / 5) * 80;
    if (this.hp <= 0) { this.destroy(); this._hpBar.destroy(); this._hpBg.destroy(); return true; }
    return false;
  }
}
```

- [ ] **Step 2: Create `src/entities/bosses/Gordao.js`**

```js
// src/entities/bosses/Gordao.js
// Boss Final — end of Phase 4. Charges at player to swallow them.
import Phaser from 'phaser';

export class Gordao extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bosses', 4); // frames 4-7 in bosses spritesheet
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.hp = 8;
    this.setScale(4);
    this.body.setImmovable(true);
    this.setCollideWorldBounds(true);
    this._chargeTimer = 0;
    this._charging = false;

    this._hpBar = scene.add.rectangle(x, y - 70, 120, 8, 0xff0000).setDepth(20).setScrollFactor(0);
    this._hpBg  = scene.add.rectangle(x, y - 70, 120, 8, 0x333333, 0.5).setDepth(19).setScrollFactor(0);
    scene.add.text(4, 4, 'BOSS FINAL', { fontSize: '12px', fill: '#FF4444' }).setDepth(21).setScrollFactor(0);
  }

  update(player) {
    this._chargeTimer++;
    if (!this._charging && this._chargeTimer % 120 === 0) this._charge(player);
    if (this._charging && (this.body.blocked.left || this.body.blocked.right)) {
      this.setVelocityX(0);
      this._charging = false;
    }
  }

  _charge(player) {
    this._charging = true;
    const dir = player.x < this.x ? -1 : 1;
    this.setFlipX(dir < 0);
    this.setVelocityX(dir * 280);
    this.scene.time.delayedCall(1200, () => {
      if (this._charging) { this.setVelocityX(0); this._charging = false; }
    });
  }

  hit() {
    this.hp--;
    this.setTint(0xFF0000);
    this.scene.time.delayedCall(200, () => this.clearTint());
    this._hpBar.width = (this.hp / 8) * 120;
    if (this.hp <= 0) { this.destroy(); this._hpBar.destroy(); this._hpBg.destroy(); return true; }
    return false;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/entities/bosses/
git commit -m "feat: HamburgerMonstro and Gordao boss classes"
```

---

## Task 15: GameOverScene + RankingScene

**Files:** `src/scenes/GameOverScene.js`, `src/scenes/RankingScene.js`

- [ ] **Step 1: Create `src/scenes/GameOverScene.js`**

```js
// src/scenes/GameOverScene.js
import Phaser from 'phaser';
import { RankingService } from '../services/RankingService.js';
import { GAME_W, GAME_H, INGREDIENTS } from '../config/game.js';

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  async create({ playerId, character, score, collected, burgerBonus }) {
    const cx = GAME_W / 2;
    const svc = new RankingService();

    this.add.rectangle(cx, GAME_H/2, GAME_W, GAME_H, 0x1a0a00);
    this.add.text(cx, 30, 'HAMBÚRGUER MONTADO!', { fontSize: '20px', fill: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5);

    // Draw collected ingredients as pixel art stack
    const frames = { pao: 1, alface: 2, tomate: 3, molho: 4, bacon: 5, hamburger: 6 };
    let stackY = 200;
    [...INGREDIENTS].reverse().forEach(ing => {
      const frame = frames[ing];
      const alpha = collected.includes(ing) ? 1 : 0.2;
      this.add.image(cx, stackY, 'collectibles', frame).setScale(3).setAlpha(alpha);
      stackY -= 28;
    });

    this.add.text(cx, 240, `SCORE: ${score}`, { fontSize: '22px', fill: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5);
    if (burgerBonus) {
      this.add.text(cx, 268, `+${500} BÔNUS HAMBÚRGUER COMPLETO!`, { fontSize: '12px', fill: '#44FF44' }).setOrigin(0.5);
    }

    // Save score
    try {
      await svc.saveScore(playerId, score, character);
      const rank = await svc.getPlayerRank(playerId);
      this.add.text(cx, 295, rank ? `Você está em ${rank}º lugar!` : '', { fontSize: '14px', fill: '#FFF' }).setOrigin(0.5);
    } catch (e) {
      this.add.text(cx, 295, 'Pontuação não salva — sem conexão.', { fontSize: '12px', fill: '#FF4444' }).setOrigin(0.5);
    }

    this._makeBtn(cx, 350, 'JOGAR NOVAMENTE', () => {
      this.scene.start('SelectCharScene', { playerId });
    });
    this._makeBtn(cx, 400, 'VER RANKING', () => {
      this.scene.start('RankingScene', { playerId });
    });
  }

  _makeBtn(x, y, label, cb) {
    this.add.text(x, y, label, { fontSize: '18px', fill: '#FFD700', fontStyle: 'bold' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', cb);
  }
}
```

- [ ] **Step 2: Create `src/scenes/RankingScene.js`**

```js
// src/scenes/RankingScene.js
import Phaser from 'phaser';
import { RankingService } from '../services/RankingService.js';
import { GAME_W, GAME_H } from '../config/game.js';

export class RankingScene extends Phaser.Scene {
  constructor() { super('RankingScene'); }

  async create({ playerId }) {
    const cx = GAME_W / 2;
    const svc = new RankingService();

    this.add.rectangle(cx, GAME_H/2, GAME_W, GAME_H, 0x1a0a00);
    this.add.text(cx, 30, '🏆 RANKING DO MÊS', { fontSize: '24px', fill: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5);

    try {
      const [top, playerRank, playerScore] = await Promise.all([
        svc.getTopTen(),
        svc.getPlayerRank(playerId),
        svc.getPlayerBestScore(playerId),
      ]);

      top.forEach((entry, i) => {
        const y = 80 + i * 30;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        const color = i < 3 ? '#FFD700' : '#FFF';
        this.add.text(80,  y, `${medal} ${entry.name}`, { fontSize: '14px', fill: color });
        this.add.text(GAME_W - 80, y, `${entry.score}`, { fontSize: '14px', fill: color }).setOrigin(1, 0);
      });

      if (playerRank && playerRank > 10) {
        this.add.text(cx, 390, `Sua posição: ${playerRank}º — ${playerScore} pts`, { fontSize: '13px', fill: '#FFA500' }).setOrigin(0.5);
      }
    } catch {
      this.add.text(cx, 200, 'Erro ao carregar ranking.', { fontSize: '14px', fill: '#FF4444' }).setOrigin(0.5);
    }

    this.add.text(cx, 430, '← MENU', { fontSize: '16px', fill: '#888' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MenuScene', { playerId }));
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/scenes/GameOverScene.js src/scenes/RankingScene.js
git commit -m "feat: GameOverScene shows burger assembly and saves score; RankingScene shows top 10"
```

---

## Task 16: Placeholder Assets (Development Only)

⚠️ This task creates minimal placeholder assets so the game runs before designer delivers final art.

- [ ] **Step 1: Create placeholder asset script**

```js
// scripts/gen-placeholders.js
// Run with: node scripts/gen-placeholders.js
// Generates 1×1 white pixel PNGs as placeholders.
import { writeFileSync, mkdirSync } from 'fs';

// 1×1 PNG bytes (minimal valid PNG)
const PNG_1x1 = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
  '2e00000000c4944415408d76360f8cf000001e2218a640000000049454e44ae426082', 'hex'
);

const dirs = [
  'public/assets/sprites', 'public/assets/tilesets',
  'public/assets/tilemaps', 'public/assets/audio/sfx',
];
dirs.forEach(d => mkdirSync(d, { recursive: true }));

const pngs = [
  'public/assets/sprites/char1.png', 'public/assets/sprites/char2.png',
  'public/assets/sprites/enemies.png', 'public/assets/sprites/bosses.png',
  'public/assets/sprites/powerups.png', 'public/assets/sprites/collectibles.png',
  'public/assets/sprites/ui.png',
  'public/assets/tilesets/cozinha.png', 'public/assets/tilesets/rua.png',
  'public/assets/tilesets/mercado.png', 'public/assets/tilesets/restaurante.png',
];
pngs.forEach(p => writeFileSync(p, PNG_1x1));

// Minimal valid tilemap JSON for testing
const minimalTilemap = JSON.stringify({
  width: 50, height: 15, tilewidth: 16, tileheight: 16,
  layers: [
    { name: 'ground', type: 'tilelayer', data: Array(50*15).fill(0), visible: true },
    { name: 'objects', type: 'objectgroup', objects: [
      { name: 'spawn', x: 60, y: 200 },
      { name: 'goal',  x: 750, y: 100 },
    ]},
    { name: 'enemies',    type: 'objectgroup', objects: [] },
    { name: 'collectibles', type: 'objectgroup', objects: [] },
    { name: 'powerups',   type: 'objectgroup', objects: [] },
  ],
  tilesets: [{ name: 'cozinha', firstgid: 1, tilewidth: 16, tileheight: 16 }],
});

['fase1','fase2','fase3','fase4'].forEach(f =>
  writeFileSync(`public/assets/tilemaps/${f}.json`, minimalTilemap)
);

// Empty MP3 placeholders (1 byte — will not play but won't crash Phaser)
const mp3s = [
  'public/assets/audio/fase1.mp3', 'public/assets/audio/fase2.mp3',
  'public/assets/audio/fase3.mp3', 'public/assets/audio/fase4.mp3',
  'public/assets/audio/boss.mp3',
  'public/assets/audio/sfx/jump.mp3', 'public/assets/audio/sfx/collect.mp3',
  'public/assets/audio/sfx/powerup.mp3', 'public/assets/audio/sfx/damage.mp3',
  'public/assets/audio/sfx/defeat.mp3',
];
mp3s.forEach(p => writeFileSync(p, Buffer.from([0])));

console.log('Placeholders created. Replace with final assets when ready.');
```

- [ ] **Step 2: Run placeholder generator**

```bash
node scripts/gen-placeholders.js
```

- [ ] **Step 3: Start dev server and verify game loads without errors**

```bash
npm run dev
```

Open browser → register → menu → select char → game loads Phase 1. Verify no fatal JS errors in console.

- [ ] **Step 4: Commit**

```bash
git add scripts/gen-placeholders.js public/assets/
git commit -m "chore: placeholder assets for development — replace with final art"
```

---

## Task 17: Vercel Deploy

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null
}
```

- [ ] **Step 2: Add env vars to Vercel**

In the Vercel dashboard → Project Settings → Environment Variables:
- `VITE_SUPABASE_URL` → your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` → your Supabase anon key

- [ ] **Step 3: Deploy**

```bash
npx vercel --prod
```

- [ ] **Step 4: Test on real mobile device**

Open the Vercel URL on an iPhone/Android. Verify:
- Cadastro form appears on first visit
- Virtual joystick and buttons render correctly
- Game starts and player can move
- Score saves to Supabase

- [ ] **Step 5: Commit**

```bash
git add vercel.json
git commit -m "feat: Vercel deploy config"
```

---

## Task 18: Final QR Code + Polish

- [ ] **Step 1: Generate QR code for the Vercel URL**

Use any QR generator (e.g. https://qr-code-generator.com) with the Vercel production URL. Print and place on tables for the reinauguration on 2026-07-10.

- [ ] **Step 2: Force landscape orientation via CSS in `index.html`**

Add inside `<style>`:
```css
@media (orientation: portrait) {
  body::before {
    content: 'Gire o celular para jogar! 📱';
    position: fixed; inset: 0; background: #1a0a00;
    color: #FFD700; font-size: 24px;
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
  }
  canvas { display: none; }
}
```

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: landscape enforcement and QR deploy ready for reinauguration"
```

---

## Handoff Notes for Designer

The following assets need to be delivered before 2026-07-05 (5 days before go-live):

| Asset | Format | Size |
|-------|--------|------|
| `char1.png` | PNG spritesheet | 16×24px per frame, at least 12 frames |
| `char2.png` | PNG spritesheet | Same |
| `enemies.png` | PNG spritesheet | 5 enemies × 4 frames = 20 frames, 16×16px each |
| `bosses.png` | PNG spritesheet | 2 bosses × 4 frames, 32×32px each |
| `powerups.png` | PNG spritesheet | 3 items, 16×16px each |
| `collectibles.png` | PNG spritesheet | 8 items (batata frita + 6 ingredients + grease blob), 16×16px each |
| `cozinha.png`, `rua.png`, `mercado.png`, `restaurante.png` | PNG tileset | 16×16px tiles |
| 4× phase tilemaps | Built in Tiled editor | Export as JSON |
| 5× audio files | MP3 | 1–2 min chiptune loops |
| 5× SFX | MP3 | < 1 sec each |
