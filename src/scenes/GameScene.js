// src/scenes/GameScene.js
import Phaser from 'phaser';
import { GAME_W, GAME_H, SCORE, INGREDIENTS, PHASES } from '../config/game.js';
import { Player } from '../entities/Player.js';
import { CollectibleSystem } from '../systems/CollectibleSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { ControlsSystem } from '../systems/ControlsSystem.js';
import { HUDSystem } from '../systems/HUDSystem.js';
import { Picles } from '../entities/enemies/Picles.js';
import { Cebola } from '../entities/enemies/Cebola.js';
import { Mosca } from '../entities/enemies/Mosca.js';
import { Refrigerante } from '../entities/enemies/Refrigerante.js';

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  init(data) {
    this._playerId   = data.playerId;
    this._character  = data.character || 1;
    this._phaseNum   = data.phase || 1;
    this._phaseConf  = PHASES[this._phaseNum];
  }

  create() {
    // Systems
    this._score       = new ScoreSystem();
    this._collectible = new CollectibleSystem();
    this._controls    = new ControlsSystem(this);
    this._hud         = new HUDSystem(this);

    // Tilemap
    const map = this.make.tilemap({ key: this._phaseConf.tilemap });
    const tiles = map.addTilesetImage(this._phaseConf.tileset, this._phaseConf.tileset);
    this._groundLayer = map.createLayer('Ground', tiles, 0, 0);
    this._groundLayer.setCollisionByProperty({ collides: true });

    // Player spawn from object layer
    const spawnObj = map.findObject('Objects', o => o.name === 'spawn');
    const spawnX = spawnObj ? spawnObj.x : 100;
    const spawnY = spawnObj ? spawnObj.y : 200;

    // Player
    this._player = new Player(this, spawnX, spawnY, this._character);
    this._player.setName('player');
    this.physics.add.collider(this._player, this._groundLayer);

    // Collectibles group
    this._friesGroup       = this.physics.add.staticGroup();
    this._ingredientGroup  = this.physics.add.staticGroup();
    this._powerUpGroup     = this.physics.add.staticGroup();

    this._spawnCollectibles(map);

    // Enemies group
    this._enemyGroup    = this.physics.add.group();
    this._potatoGroup   = this.physics.add.group();

    this._spawnEnemies(map);

    // Collisions
    this.physics.add.collider(this._enemyGroup, this._groundLayer);
    this.physics.add.collider(this._potatoGroup, this._groundLayer, (p) => p.destroy());

    // Overlaps
    this.physics.add.overlap(this._player, this._friesGroup,      this._onFries,      null, this);
    this.physics.add.overlap(this._player, this._ingredientGroup, this._onIngredient,  null, this);
    this.physics.add.overlap(this._player, this._powerUpGroup,    this._onPowerUp,     null, this);
    this.physics.add.overlap(this._player, this._enemyGroup,      this._onEnemyTouch,  null, this);
    this.physics.add.overlap(this._potatoGroup, this._enemyGroup, this._onPotatoHit,   null, this);

    // Potato events
    this.events.on('potato_thrown', potato => {
      this._potatoGroup.add(potato);
      this.physics.add.collider(potato, this._groundLayer, () => potato.destroy());
    });

    // Cebola scramble event
    this.events.on('controls_scrambled', () => {
      // Player._controlsScrambled is already set by Cebola.onHitPlayer()
    });

    // Explosion event
    this.events.on('explosion', (ex, ey, radius) => {
      const dist = Phaser.Math.Distance.Between(this._player.x, this._player.y, ex, ey);
      if (dist <= radius) this._damagePlayer();
    });

    // Camera
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this._player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);

    // Music
    if (this.sound.get(this._phaseConf.music)) {
      this.sound.play(this._phaseConf.music, { loop: true, volume: 0.4 });
    }

    // End-of-phase trigger
    const goalObj = map.findObject('Objects', o => o.name === 'goal');
    if (goalObj) {
      const goalZone = this.add.zone(goalObj.x, goalObj.y, goalObj.width || 32, goalObj.height || 64);
      this.physics.world.enable(goalZone);
      this.physics.add.overlap(this._player, goalZone, this._onGoal, null, this);
    }

    // If boss phase, start boss after short delay
    if (this._phaseConf.boss) {
      this.time.delayedCall(500, () => this._spawnBoss());
    }
  }

  _spawnCollectibles(map) {
    map.getObjectLayer('Objects')?.objects.forEach(obj => {
      if (obj.type === 'fries') {
        const img = this.physics.add.staticImage(obj.x, obj.y, 'collectibles', 6);
        this._friesGroup.add(img);
      }
      if (INGREDIENTS.includes(obj.type)) {
        const frame = INGREDIENTS.indexOf(obj.type);
        const img = this.physics.add.staticImage(obj.x, obj.y, 'collectibles', frame);
        img.setData('type', obj.type);
        this._ingredientGroup.add(img);
      }
      if (obj.type === 'mushroom') {
        const img = this.physics.add.staticImage(obj.x, obj.y, 'powerups', 0);
        img.setData('kind', 'mushroom');
        this._powerUpGroup.add(img);
      }
      if (obj.type === 'potato_raw') {
        const img = this.physics.add.staticImage(obj.x, obj.y, 'powerups', 1);
        img.setData('kind', 'potato_raw');
        this._powerUpGroup.add(img);
      }
      if (obj.type === 'star') {
        const img = this.physics.add.staticImage(obj.x, obj.y, 'powerups', 2);
        img.setData('kind', 'star');
        this._powerUpGroup.add(img);
      }
    });
  }

  _spawnEnemies(map) {
    const EnemyMap = { picles: Picles, cebola: Cebola, mosca: Mosca, refrigerante: Refrigerante };
    map.getObjectLayer('Objects')?.objects.forEach(obj => {
      const Cls = EnemyMap[obj.type];
      if (Cls) {
        const enemy = new Cls(this, obj.x, obj.y);
        this._enemyGroup.add(enemy);
        this.physics.add.collider(enemy, this._groundLayer);
      }
    });
  }

  _spawnBoss() {
    const bossKey = this._phaseConf.boss;
    import(`../entities/bosses/${bossKey === 'boss1' ? 'HamburgerMonstro' : 'Gordao'}.js`).then(mod => {
      const BossCls = bossKey === 'boss1' ? mod.HamburgerMonstro : mod.Gordao;
      this._boss = new BossCls(this, GAME_W - 100, 200);
      this.physics.add.collider(this._boss, this._groundLayer);
      this.physics.add.overlap(this._player, this._boss, this._onEnemyTouch, null, this);
      this.physics.add.overlap(this._potatoGroup, this._boss, (potato, boss) => {
        potato.destroy();
        boss.takeDamage(1);
        if (boss.isDead()) this._onBossDefeated();
      }, null, this);
    });
  }

  _onFries(player, fries) {
    fries.destroy();
    this._score.add(SCORE.FRIES);
    this._hud.updateScore(this._score.get());
    this.sound.play('sfx_collect');
  }

  _onIngredient(player, item) {
    const type = item.getData('type');
    item.destroy();
    this._collectible.add(type);
    this._score.add(SCORE.INGREDIENT);
    this._hud.updateIngredients(this._collectible.collected);
    if (this._collectible.hasAll()) {
      this._score.addBurgerBonus(true);
      this._hud.showBurgerBonus();
      this._hud.updateScore(this._score.get());
    } else {
      this._hud.updateScore(this._score.get());
    }
    this.sound.play('sfx_collect');
  }

  _onPowerUp(player, item) {
    const kind = item.getData('kind');
    item.destroy();
    if (kind === 'mushroom')    { player.applyMushroom(); this._hud.updatePowerState(player.powerUpSystem.state); }
    if (kind === 'potato_raw')  { player.applyPotato();   this._hud.updatePowerState(player.powerUpSystem.state); }
    if (kind === 'star')        { player.activateInvincibility(); }
  }

  _onEnemyTouch(player, enemy) {
    if (enemy.isDead()) return;

    // Spin jump defeats any enemy; stomp defeats only non-flying enemies
    const spinning = player.isSpinJumping();
    const stomping = !spinning && player.body.velocity.y > 0 && player.y < enemy.y;
    const canStomp = enemy.canBeStopped?.() !== false;

    if (spinning || (stomping && canStomp)) {
      enemy.takeDamage();
      player.setVelocityY(-200);
      this._score.add(100);
      this._hud.updateScore(this._score.get());
      return;
    }

    // Cebola special: scramble controls on side-hit
    if (enemy instanceof Cebola) {
      enemy.onHitPlayer(player);
    }

    this._damagePlayer();
  }

  _damagePlayer() {
    const result = this._player.takeDamage();
    this._hud.updatePowerState(this._player.powerUpSystem.state);
    if (result === 'life_lost') {
      this._hud.updateLives(this._player.lives);
      this._respawnPlayer();
    } else if (result === 'game_over') {
      this._hud.updateLives(0);
      this.time.delayedCall(800, () => this._gameOver());
    }
  }

  _respawnPlayer() {
    this._player.setAlpha(0);
    this.time.delayedCall(1200, () => {
      const map = this.cache.tilemap.get(this._phaseConf.tilemap);
      const spawnObj = map?.data?.layers?.find(l => l.name === 'Objects')?.objects?.find(o => o.name === 'spawn');
      this._player.reset(spawnObj ? spawnObj.x : 100, spawnObj ? spawnObj.y : 200);
    });
  }

  _onPotatoHit(potato, enemy) {
    if (enemy.isDead()) return;
    potato.destroy();
    enemy.takeDamage();
    this._score.add(100);
    this._hud.updateScore(this._score.get());
  }

  _onGoal() {
    this.sound.stopAll();
    const nextPhase = this._phaseNum + 1;
    if (PHASES[nextPhase]) {
      this.scene.restart({ playerId: this._playerId, character: this._character, phase: nextPhase });
    } else {
      // All phases complete → GameOver with win flag
      this.scene.start('GameOverScene', { playerId: this._playerId, score: this._score.get(), win: true });
    }
  }

  _onBossDefeated() {
    this.sound.play('sfx_powerup');
    this.time.delayedCall(2000, () => this._onGoal());
  }

  _gameOver() {
    this.sound.stopAll();
    this.scene.start('GameOverScene', { playerId: this._playerId, score: this._score.get(), win: false });
  }

  update(time, delta) {
    if (!this._player || !this._player.active) return;
    const ctrl = this._controls.getState();
    // Apply scrambled controls (Cebola effect)
    if (this._player._controlsScrambled) {
      [ctrl.left, ctrl.right] = [ctrl.right, ctrl.left];
    }
    this._player.update(ctrl);
    this._enemyGroup.getChildren().forEach(e => e.update(delta));
    if (this._boss && !this._boss.isDead()) this._boss.update(delta);
  }

  shutdown() {
    this.sound.stopAll();
    this._hud.destroy();
    this._controls.destroy();
    this.events.removeAllListeners();
  }
}
