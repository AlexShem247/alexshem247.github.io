const WIDTH = 1280;
const HEIGHT = 720;
const COLORS = {
  black: "#000000",
  darkGray: "#646464",
  lightGray: "#cccccc",
  white: "#ffffff",
  darkGreen: "#027a12",
  blue: "#0086d9",
  red: "#ff2200",
  green: "#0ac23e",
  yellow: "#f2de00",
};

const CENTER_TOLERANCE = 10;
const EXCLAM_SPACING = 10;
const MAX_AMMO = 10;
const GUN_POWER = 0.5;
const LOGIC_FPS = 30;
const MIN_RENDER_FPS = 5;
const MAX_RENDER_FPS = 240;

const ROUND_CONFIGS = [
  {
    kind: "round",
    roundNo: 0,
    enemyType: "targets",
    background: "Images/Range_BG.png",
    extraBackground: null,
    bgMusic: null,
    reverse: false,
    enemyDuration: 3,
    despawn: true,
    maxEnemies: 5,
    spawnRate: 0.1,
    loc: { xStart: 150, xEnd: 2350, yStart: 100, yEnd: 900, xSpacing: 200, ySpacing: 200 },
    enemies: {
      normal: {
        name: "Target",
        kind: "target",
        points: 10,
        bonus: 10,
        spawnFrames: 5,
        shotFrames: 3,
        quantity: 30,
        idFrames: 1,
        moveVal: null,
        description: "Normal Targets are worth 10 points",
        bonusDescription: "(20 if hit in the centre)",
      },
      bonus: {
        name: "Gold_Target",
        kind: "target",
        points: 50,
        bonus: 10,
        spawnFrames: 5,
        shotFrames: 3,
        quantity: 10,
        idFrames: 1,
        moveVal: null,
        description: "Gold Targets are worth 50 points",
        bonusDescription: "(60 if hit in the centre)",
      },
      penalty: {
        name: "Penalty_Target",
        kind: "target",
        points: -30,
        bonus: 0,
        spawnFrames: 5,
        shotFrames: 3,
        quantity: 10,
        idFrames: 1,
        moveVal: null,
        description: "Purple Targets will take away 30 points",
        bonusDescription: null,
      },
    },
  },
  {
    kind: "round",
    roundNo: 1,
    enemyType: "birds",
    background: "Images/Grass_BG.png",
    extraBackground: "Images/Grass_BG_Extra.png",
    bgMusic: "Audio/Bird_Sounds.mp3",
    reverse: true,
    enemyDuration: null,
    despawn: false,
    maxEnemies: 5,
    spawnRate: 0.1,
    loc: { xStart: 0, xEnd: 1500, yStart: 50, yEnd: 450, xSpacing: 1500, ySpacing: 80 },
    enemies: {
      normal: {
        name: "Pigeon",
        kind: "bird",
        points: 20,
        bonus: 0,
        spawnFrames: 0,
        shotFrames: 60,
        quantity: 30,
        idFrames: 5,
        moveVal: [10, 0],
        description: "Pigeons are worth 20 points",
        bonusDescription: null,
      },
      bonus: {
        name: "Blue_Bird",
        kind: "bird",
        points: 75,
        bonus: 0,
        spawnFrames: 0,
        shotFrames: 60,
        quantity: 10,
        idFrames: 4,
        moveVal: [15, 0],
        description: "Blue Birds are worth 75 points",
        bonusDescription: null,
      },
      penalty: {
        name: "Biplane",
        kind: "bird",
        points: -100,
        bonus: 0,
        spawnFrames: 0,
        shotFrames: 60,
        quantity: 10,
        idFrames: 1,
        moveVal: [10, 0],
        description: "Shooting planes will take away 100 points",
        bonusDescription: null,
      },
    },
  },
  {
    kind: "round",
    roundNo: 2,
    enemyType: "space vehicles",
    background: "Images/Space_BG.png",
    extraBackground: null,
    bgMusic: "Audio/Space_Music.mp3",
    reverse: true,
    enemyDuration: null,
    despawn: false,
    maxEnemies: 5,
    spawnRate: 0.1,
    loc: { xStart: 0, xEnd: 1500, yStart: 50, yEnd: 450, xSpacing: 1500, ySpacing: 80 },
    enemies: {
      normal: {
        name: "Spaceship",
        kind: "spaceship",
        points: 30,
        bonus: 0,
        spawnFrames: 0,
        shotFrames: 10,
        quantity: 20,
        idFrames: 0,
        moveVal: [15, 0],
        description: "Spaceships are worth 30 points",
        bonusDescription: null,
      },
      bonus: {
        name: "Rocket",
        kind: "spaceship",
        points: 50,
        bonus: 0,
        spawnFrames: 0,
        shotFrames: 10,
        quantity: 20,
        idFrames: 0,
        moveVal: [15, 0],
        description: "Rockets are worth 50 points",
        bonusDescription: null,
      },
      penalty: {
        name: "UFO",
        kind: "spaceship",
        points: 200,
        bonus: 0,
        spawnFrames: 0,
        shotFrames: 10,
        quantity: 5,
        idFrames: 0,
        moveVal: [30, 0],
        description: "UFOs are worth 200 points",
        bonusDescription: null,
      },
    },
  },
  {
    kind: "boss",
    roundNo: 3,
    background: "Images/Space_BG.png",
    extraBackground: null,
    bgMusic: "Audio/Space_Music.mp3",
    spawnRate: 5,
    maxEnemies: 3,
    boss: {
      name: "Boss",
      kind: "boss",
      points: 2,
      shotFrames: 14,
      shootFrames: 45,
      moveVal: 1,
      health: 80,
      shootRate: 9,
      bossBonus: 300,
      spawnX: 1200,
      spawnY: -300,
      endX: 400,
      endY: 400,
      strength: 0.22,
      widthOffset: 400,
      heightOffset: 100,
      description: "The Boss's healthbar will be displayed above",
      bonusDescription: "Attacks are powerful, but are slow to recharge",
    },
    minion: {
      name: "Minion",
      kind: "minion",
      points: 10,
      shotFrames: 10,
      shootFrames: 20,
      moveVal: 10,
      shootRate: 5,
      strength: 0.03,
      description: "The Bossship will summon smaller",
      bonusDescription: "spaceships to attack you",
    },
  },
];

const IMAGE_PATHS = [
  "Images/game_logo.png",
  "Images/gameplay.png",
  "Images/logo.ico",
  "Images/Range_BG.png",
  "Images/Grass_BG.png",
  "Images/Grass_BG_Extra.png",
  "Images/Space_BG.png",
  "Images/Left_Exclam.png",
  "Images/Right_Exclam.png",
  "Images/Up_Exclam.png",
  "Images/Down_Exclam.png",
  "Images/1.png",
  "Images/2.png",
  "Images/3.png",
  "Images/go.png",
  "Images/Crosshair_Blue.png",
  "Images/Crosshair_Red.png",
  "Images/Crosshair_Green.png",
  "Images/Crosshair_Yellow.png",
  "Images/Target.png",
  "Images/Target_1.png",
  "Images/Target_2.png",
  "Images/Target_3.png",
  "Images/Target_4.png",
  "Images/Target_5.png",
  "Images/Target_Break1.png",
  "Images/Target_Break2.png",
  "Images/Target_Break3.png",
  "Images/Gold_Target.png",
  "Images/Gold_Target_1.png",
  "Images/Gold_Target_2.png",
  "Images/Gold_Target_3.png",
  "Images/Gold_Target_4.png",
  "Images/Gold_Target_5.png",
  "Images/Gold_Target_Break1.png",
  "Images/Gold_Target_Break2.png",
  "Images/Gold_Target_Break3.png",
  "Images/Penalty_Target.png",
  "Images/Penalty_Target_1.png",
  "Images/Penalty_Target_2.png",
  "Images/Penalty_Target_3.png",
  "Images/Penalty_Target_4.png",
  "Images/Penalty_Target_5.png",
  "Images/Penalty_Target_Break1.png",
  "Images/Penalty_Target_Break2.png",
  "Images/Penalty_Target_Break3.png",
  "Images/Pigeon.png",
  "Images/Pigeon_1.png",
  "Images/Pigeon_2.png",
  "Images/Pigeon_3.png",
  "Images/Pigeon_4.png",
  "Images/Pigeon_5.png",
  "Images/Pigeon_Break1.png",
  "Images/Blue_Bird.png",
  "Images/Blue_Bird_1.png",
  "Images/Blue_Bird_2.png",
  "Images/Blue_Bird_3.png",
  "Images/Blue_Bird_4.png",
  "Images/Blue_Bird_Break1.png",
  "Images/Biplane.png",
  "Images/Biplane_Break1.png",
  "Images/Spaceship.png",
  "Images/Spaceship_Break1.png",
  "Images/Rocket.png",
  "Images/Rocket_Break1.png",
  "Images/UFO.png",
  "Images/UFO_Break1.png",
  "Images/Boss.png",
  "Images/Boss_Shoot.png",
  "Images/Boss_Break1.png",
  "Images/Boss_Break2.png",
  "Images/Boss_Break3.png",
  "Images/Boss_Break4.png",
  "Images/Boss_Break5.png",
  "Images/Boss_Break6.png",
  "Images/Boss_Break7.png",
  "Images/Boss_Break8.png",
  "Images/Boss_Break9.png",
  "Images/Boss_Break10.png",
  "Images/Boss_Break11.png",
  "Images/Boss_Break12.png",
  "Images/Boss_Break13.png",
  "Images/Boss_Break14.png",
  "Images/Minion.png",
  "Images/Minion_Shoot.png",
  "Images/Minion_Break1.png",
];

const AUDIO_PATHS = [
  "Audio/Shot.mp3",
  "Audio/Start_Round1.mp3",
  "Audio/Start_Round2.mp3",
  "Audio/Start_Round3.mp3",
  "Audio/Bird_Sounds.mp3",
  "Audio/Space_Music.mp3",
  "Audio/Target_Shot.mp3",
  "Audio/Gold_Target_Shot.mp3",
  "Audio/Penalty_Target_Shot.mp3",
  "Audio/Pigeon_Shot.mp3",
  "Audio/Blue_Bird_Shot.mp3",
  "Audio/Biplane_Shot.mp3",
  "Audio/Spaceship_Shot.mp3",
  "Audio/Rocket_Shot.mp3",
  "Audio/UFO_Shot.mp3",
  "Audio/Boss_Shot.mp3",
  "Audio/Boss_Shoot1.mp3",
  "Audio/Boss_Shoot2.mp3",
  "Audio/Minion_Shot.mp3",
  "Audio/Minion_Shoot.mp3",
];

class Assets {
  constructor() {
    this.images = new Map();
    this.audioTemplates = new Map();
    this.activeSounds = new Set();
  }

  async load() {
    await Promise.all(IMAGE_PATHS.map((path) => this.loadImage(path)));
    AUDIO_PATHS.forEach((path) => this.loadAudioTemplate(path));
  }

  loadImage(path) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        this.images.set(path, image);
        resolve(image);
      };
      image.onerror = reject;
      image.src = path;
    });
  }

  loadAudioTemplate(path) {
    const audio = new Audio(path);
    audio.preload = "auto";
    this.audioTemplates.set(path, audio);
  }

  getImage(path) {
    return this.images.get(path);
  }

  playSound(path, volume = 1, loop = false) {
    const template = this.audioTemplates.get(path);
    if (!template) {
      return null;
    }
    const audio = template.cloneNode();
    audio.volume = volume;
    audio.loop = loop;
    this.activeSounds.add(audio);
    audio.addEventListener("ended", () => {
      this.activeSounds.delete(audio);
    }, { once: true });
    audio.addEventListener("pause", () => {
      if (!audio.loop && audio.currentTime >= audio.duration) {
        this.activeSounds.delete(audio);
      }
    });
    audio.play().catch(() => {});
    return audio;
  }
}

class Entity {
  constructor(config, x, y, reverse = false, slot = null) {
    this.config = config;
    this.name = config.name;
    this.kind = config.kind;
    this.worldX = x;
    this.worldY = y;
    this.spawnX = x;
    this.spawnY = y;
    this.reverse = reverse;
    this.slot = slot;
    this.points = config.points;
    this.bonus = config.bonus ?? 0;
    this.spawnFrames = config.spawnFrames ?? 0;
    this.shotFrames = config.shotFrames;
    this.idFrames = config.idFrames ?? 0;
    this.moveVal = config.moveVal;
    this.shootFrames = config.shootFrames ?? 0;
    this.shootStart = config.name === "Boss" ? 20 : 1;
    this.health = config.health ?? 0;
    this.timer = 0;
    this.frameNo = 1;
    this.state = this.spawnFrames > 0 ? "spawning" : "alive";
  }

  getBaseImagePath() {
    return `Images/${this.name}.png`;
  }

  getCurrentImagePath() {
    if (this.state === "spawning") {
      return `Images/${this.name}_${Math.max(1, Math.floor(this.frameNo))}.png`;
    }
    if (this.state === "despawning") {
      return `Images/${this.name}_${Math.max(1, Math.floor(this.frameNo))}.png`;
    }
    if (this.state === "shot") {
      if (this.kind === "target") {
        return `Images/${this.name}_Break${Math.max(1, Math.floor(this.frameNo))}.png`;
      }
      if (this.kind === "boss") {
        return `Images/${this.name}_Break${Math.max(1, Math.floor(this.frameNo))}.png`;
      }
      return `Images/${this.name}_Break1.png`;
    }
    if (this.state === "shooting") {
      if (this.kind === "boss" && this.frameNo > this.shootStart) {
        return `Images/${this.name}_Shoot.png`;
      }
      if (this.kind === "minion") {
        return `Images/${this.name}_Shoot.png`;
      }
      return this.getBaseImagePath();
    }
    if (this.kind === "bird" && this.idFrames > 1) {
      return `Images/${this.name}_${Math.max(1, Math.floor(this.frameNo))}.png`;
    }
    return this.getBaseImagePath();
  }
}

class Game {
  constructor(assets, ctx) {
    this.assets = assets;
    this.ctx = ctx;
    this.settings = { fps: 60, volume: 0.8, crosshairColor: "blue" };
    this.mouse = { x: WIDTH / 2, y: HEIGHT / 2 };
    this.score = 0;
    this.currentRoundIndex = 0;
    this.frameAccumulator = 0;
    this.lastTime = 0;
    this.lastRenderTime = 0;
    this.running = false;
    this.scene = "idle";
    this.activeMusic = null;
    this.pendingResume = null;
    this.roundState = null;
    this.needsRender = true;
    this.finishedHandler = null;
  }

  setFinishedHandler(handler) {
    this.finishedHandler = handler;
  }

  setSettings(next) {
    const fps = clamp(Math.round(next.fps ?? this.settings.fps), MIN_RENDER_FPS, MAX_RENDER_FPS);
    this.settings = { ...this.settings, ...next, fps };
  }

  start() {
    this.score = 0;
    this.currentRoundIndex = 0;
    this.running = true;
    this.scene = "roundIntro";
    this.roundState = null;
    this.lastTime = 0;
    this.lastRenderTime = 0;
    this.frameAccumulator = 0;
    this.showRoundIntro();
    requestAnimationFrame((time) => this.loop(time));
  }

  stop() {
    this.running = false;
    this.scene = "idle";
    this.stopMusic();
  }

  loop(timestamp) {
    if (!this.running) {
      return;
    }

    if (!this.lastTime) {
      this.lastTime = timestamp;
      this.lastRenderTime = timestamp;
    }
    const logicFrameMs = 1000 / LOGIC_FPS;
    const renderFrameMs = 1000 / clamp(this.settings.fps, MIN_RENDER_FPS, MAX_RENDER_FPS);
    this.frameAccumulator += timestamp - this.lastTime;
    this.lastTime = timestamp;

    while (this.frameAccumulator >= logicFrameMs) {
      this.updateFrame();
      this.frameAccumulator -= logicFrameMs;
    }

    if (timestamp - this.lastRenderTime >= renderFrameMs) {
      this.render();
      this.lastRenderTime = timestamp;
    }
    requestAnimationFrame((time) => this.loop(time));
  }

  updateFrame() {
    if (this.scene === "countdown") {
      this.updateCountdown();
      return;
    }
    if (this.scene === "round") {
      this.updateStandardRound();
      return;
    }
    if (this.scene === "bossRound") {
      this.updateBossRound();
    }
  }

  render() {
    if (!this.running) {
      return;
    }
    if (this.scene === "countdown") {
      this.renderCountdown();
      return;
    }
    if (this.scene === "round") {
      this.renderStandardRound();
      return;
    }
    if (this.scene === "bossRound") {
      this.renderBossRound();
      return;
    }
    if (this.roundState?.backgroundImage) {
      this.drawBackground(this.roundState.backgroundImage);
    } else {
      this.ctx.fillStyle = COLORS.black;
      this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  showRoundIntro() {
    const config = ROUND_CONFIGS[this.currentRoundIndex];
    if (config.kind === "boss") {
      app.showBossIntro(config, () => this.startCountdown(config));
      return;
    }
    app.showRoundIntro(config, () => this.startCountdown(config));
  }

  startCountdown(config) {
    this.stopMusic();
    this.scene = "countdown";
    this.roundState = {
      config,
      countdownFrame: 1,
      countdownBgImage: this.assets.getImage(config.background),
    };
    this.assets.playSound("Audio/Start_Round1.mp3", this.settings.volume);
  }

  updateCountdown() {
    const state = this.roundState;
    state.countdownFrame += 1;
    const fps = LOGIC_FPS;

    if (state.countdownFrame === fps) {
      this.assets.playSound("Audio/Start_Round1.mp3", this.settings.volume);
    } else if (state.countdownFrame === fps * 2) {
      this.assets.playSound("Audio/Start_Round2.mp3", this.settings.volume);
    } else if (state.countdownFrame === fps * 3) {
      this.assets.playSound("Audio/Start_Round3.mp3", this.settings.volume);
    } else if (state.countdownFrame >= fps * 4) {
      if (state.config.kind === "boss") {
        this.beginBossRound(state.config);
      } else {
        this.beginStandardRound(state.config);
      }
    }
  }

  renderCountdown() {
    const state = this.roundState;
    this.drawBackground(state.countdownBgImage);
    const fps = LOGIC_FPS;
    let imagePath = "Images/3.png";
    if (state.countdownFrame >= fps * 3) {
      imagePath = "Images/go.png";
    } else if (state.countdownFrame >= fps * 2) {
      imagePath = "Images/1.png";
    } else if (state.countdownFrame >= fps) {
      imagePath = "Images/2.png";
    }
    const image = this.assets.getImage(imagePath);
    this.ctx.drawImage(image, WIDTH / 2 - image.width / 2, HEIGHT / 2 - image.height / 2);
  }

  beginStandardRound(config) {
    const enemyGrid = [];
    for (let x = config.loc.xStart; x <= config.loc.xEnd; x += config.loc.xSpacing) {
      for (let y = config.loc.yStart; y <= config.loc.yEnd; y += config.loc.ySpacing) {
        enemyGrid.push([x, y]);
      }
    }

    const enemyPool = [];
    [["normal", config.enemies.normal], ["bonus", config.enemies.bonus], ["penalty", config.enemies.penalty]].forEach(
      ([, enemyConfig]) => {
        for (let i = 0; i < enemyConfig.quantity; i += 1) {
          enemyPool.push(enemyConfig);
        }
      }
    );

    this.roundState = {
      config,
      backgroundImage: this.assets.getImage(config.background),
      extraBackgroundImage: config.extraBackground ? this.assets.getImage(config.extraBackground) : null,
      ammo: 10,
      enemyGrid,
      enemyPool,
      enemies: [],
      shotEnemies: [],
      despawningEnemies: [],
      enemiesHit: {
        [config.enemies.normal.name]: 0,
        [config.enemies.bonus.name]: 0,
        [config.enemies.penalty.name]: 0,
      },
      pendingPause: false,
    };

    for (let i = 0; i < config.maxEnemies; i += 1) {
      this.spawnStandardEnemy();
    }

    if (config.bgMusic) {
      this.activeMusic = this.assets.playSound(config.bgMusic, this.settings.volume, true);
    }
    this.scene = "round";
  }

  spawnStandardEnemy() {
    const state = this.roundState;
    if (!state.enemyGrid.length || !state.enemyPool.length) {
      return;
    }
    const gridIndex = Math.floor(Math.random() * state.enemyGrid.length);
    const [x, y] = state.enemyGrid.splice(gridIndex, 1)[0];
    const poolIndex = Math.floor(Math.random() * state.enemyPool.length);
    const enemyConfig = state.enemyPool.splice(poolIndex, 1)[0];
    const reverse = Boolean(state.config.reverse && x === state.config.loc.xEnd);
    state.enemies.push(new Entity(enemyConfig, x, y, reverse));
  }

  isEntityBeyondWorldBounds(entity, config) {
    const image = this.assets.getImage(entity.getCurrentImagePath()) || this.assets.getImage(entity.getBaseImagePath());
    const halfWidth = image ? image.width / 2 : 0;
    const leftLimit = config.loc.xStart - WIDTH - halfWidth;
    const rightLimit = config.loc.xEnd + WIDTH + halfWidth;
    return entity.worldX < leftLimit || entity.worldX > rightLimit;
  }

  updateStandardRound() {
    const state = this.roundState;
    const config = state.config;

    if (!state.enemyPool.length && !state.enemies.length && !state.shotEnemies.length) {
      this.finishStandardRound();
      return;
    }

    const nextEnemies = [];
    const nextDespawn = [];

    for (const enemy of state.enemies) {
      if (enemy.state === "spawning") {
        if (enemy.frameNo < enemy.spawnFrames + 1) {
          enemy.frameNo += 0.5;
        } else {
          enemy.state = "alive";
          enemy.frameNo = 1;
        }
      } else if (enemy.state === "despawning") {
        if (enemy.frameNo > 1) {
          enemy.frameNo -= 0.5;
          nextEnemies.push(enemy);
        } else {
          state.enemyGrid.push([enemy.spawnX, enemy.spawnY]);
        }
        continue;
      } else {
        if (enemy.kind === "bird" && enemy.idFrames > 1) {
          enemy.frameNo += 0.25;
          if (enemy.frameNo > enemy.idFrames) {
            enemy.frameNo = 1;
          }
        }

        if (enemy.moveVal) {
          const moveX = enemy.moveVal[0] * (enemy.reverse ? -1 : 1);
          enemy.worldX += moveX;
          enemy.worldY += enemy.moveVal[1];
        }

        if (this.isEntityBeyondWorldBounds(enemy, config)) {
          state.enemyGrid.push([enemy.spawnX, enemy.spawnY]);
          continue;
        }

        enemy.timer += 1;
        if (
          config.enemyDuration &&
          enemy.timer / LOGIC_FPS >= config.enemyDuration &&
          config.despawn &&
          enemy.state !== "despawning"
        ) {
          enemy.state = "despawning";
          enemy.frameNo = enemy.spawnFrames;
          nextEnemies.push(enemy);
          nextDespawn.push(enemy);
          continue;
        }
      }
      nextEnemies.push(enemy);
    }

    state.enemies = nextEnemies;
    state.despawningEnemies = nextDespawn;

    const nextShot = [];
    for (const enemy of state.shotEnemies) {
      if (enemy.kind === "bird") {
        enemy.worldY += Math.max(4, (HEIGHT * 2 - enemy.worldY - 500) / Math.max(1, enemy.shotFrames / enemy.frameNo));
        enemy.frameNo += 0.25;
      } else if (enemy.kind === "boss") {
        enemy.frameNo += 0.2;
      } else if (enemy.kind === "minion") {
        enemy.frameNo += 0.5;
      } else if (enemy.kind === "spaceship") {
        enemy.frameNo += 0.25;
      } else {
        enemy.frameNo += 0.5;
      }

      if (enemy.frameNo < enemy.shotFrames + 1) {
        nextShot.push(enemy);
      }
    }
    state.shotEnemies = nextShot;

    if (state.enemies.length < config.maxEnemies && state.enemyPool.length && Math.random() < config.spawnRate) {
      this.spawnStandardEnemy();
    }
  }

  renderStandardRound() {
    const state = this.roundState;
    this.drawBackground(state.backgroundImage);
    this.drawEntities(state.enemies);
    this.drawEntities(state.shotEnemies);
    if (state.extraBackgroundImage) {
      this.drawBackground(state.extraBackgroundImage, false);
    }
    this.drawOffscreenWarnings(state.enemies);
    this.drawHud(state.ammo, this.score);
    this.drawCrosshair();
  }

  finishStandardRound() {
    this.stopMusic();
    this.scene = "interstitial";
    const config = this.roundState.config;
    const enemiesHit = this.roundState.enemiesHit;
    app.showRoundSummary(config.roundNo + 1, enemiesHit, this.score, () => {
      this.currentRoundIndex += 1;
      this.showRoundIntro();
    });
  }

  beginBossRound(config) {
    const boss = new Entity(config.boss, config.boss.spawnX, config.boss.spawnY, false);
    boss.state = "alive";
    boss.frameNo = 1;
    boss.health = config.boss.health;

    this.roundState = {
      config,
      backgroundImage: this.assets.getImage(config.background),
      ammo: 10,
      health: 100,
      timer: 1,
      bossDefeated: false,
      boss,
      minions: [],
      shotEntities: [],
      shootingEntities: [],
      usedMinionSlots: [],
      enemiesHit: {
        [config.boss.name]: 0,
        [config.minion.name]: 0,
      },
    };

    if (config.bgMusic) {
      this.activeMusic = this.assets.playSound(config.bgMusic, this.settings.volume, true);
    }
    this.scene = "bossRound";
  }

  updateBossRound() {
    const state = this.roundState;
    const { config, boss } = state;

    if ((!state.boss && !state.minions.length && !state.shotEntities.length) || state.health <= 0) {
      this.finishBossRound();
      return;
    }

    if (boss && boss.worldY < config.boss.endY) {
      boss.worldY += boss.config.moveVal * 2;
      for (const minion of state.minions) {
        minion.worldY += boss.config.moveVal * 2;
      }
    }

    let moveVal = 0;
    let minionNo = 2;
    if (boss) {
      if (boss.health <= 25) {
        moveVal = boss.worldX > config.boss.spawnX ? -boss.config.moveVal : 0;
        minionNo = 5;
      } else if (boss.health <= 50) {
        moveVal = boss.worldX < config.boss.spawnX + config.boss.endX ? boss.config.moveVal : 0;
        minionNo = 4;
      } else if (boss.health <= 75) {
        moveVal = boss.worldX > config.boss.spawnX - config.boss.endX ? -boss.config.moveVal : 0;
        minionNo = 3;
      }
      boss.worldX += moveVal;
      for (const minion of state.minions) {
        minion.worldX += moveVal;
      }
    }

    if (state.timer === LOGIC_FPS * config.spawnRate && boss && boss.health > 5) {
      const spawns = [
        [boss.worldX - config.boss.widthOffset, boss.worldY - config.boss.heightOffset],
        [boss.worldX + config.boss.widthOffset, boss.worldY - config.boss.heightOffset],
        [boss.worldX - config.boss.widthOffset, boss.worldY + config.boss.heightOffset],
        [boss.worldX + config.boss.widthOffset, boss.worldY + config.boss.heightOffset],
        [boss.worldX, boss.worldY + 3 * config.boss.heightOffset],
      ];
      for (let i = 0; i < minionNo; i += 1) {
        if (!state.usedMinionSlots.includes(i)) {
          state.minions.push(new Entity(config.minion, spawns[i][0], spawns[i][1], false, i));
          state.usedMinionSlots.push(i);
        }
      }
    }

    if ((state.timer % LOGIC_FPS) * config.minion.shootRate === 0) {
      for (const minion of state.minions) {
        if (minion.state === "alive" && !state.shootingEntities.includes(minion)) {
          minion.state = "shooting";
          minion.frameNo = 1;
          state.shootingEntities.push(minion);
          this.assets.playSound("Audio/Minion_Shoot.mp3", this.settings.volume);
        }
      }
    }

    if (state.timer === LOGIC_FPS * config.boss.shootRate && boss) {
      boss.state = "shooting";
      boss.frameNo = 1;
      state.shootingEntities.push(boss);
      this.assets.playSound("Audio/Boss_Shoot1.mp3", this.settings.volume);
      state.timer = 1;
    }

    const nextShooting = [];
    for (const entity of state.shootingEntities) {
      if (entity.kind === "boss") {
        if (entity.health > 5 && entity.frameNo < entity.shootFrames + 1) {
          if (entity.frameNo === entity.shootStart) {
            this.assets.playSound("Audio/Boss_Shoot2.mp3", this.settings.volume);
          }
          entity.frameNo += 0.5;
          if (entity.frameNo >= entity.shootStart) {
            state.health -= config.boss.strength;
          }
          nextShooting.push(entity);
        } else {
          entity.state = "alive";
          entity.frameNo = 1;
        }
      } else {
        state.health -= config.minion.strength;
        if (entity.frameNo < entity.shootFrames + 1) {
          entity.frameNo += 1;
          nextShooting.push(entity);
        } else {
          entity.state = "alive";
          entity.frameNo = 1;
        }
      }
    }
    state.shootingEntities = nextShooting;

    const nextShot = [];
    for (const entity of state.shotEntities) {
      if (entity.kind === "boss") {
        if (entity.frameNo === 1) {
          this.assets.playSound("Audio/Boss_Shot.mp3", this.settings.volume);
        }
        entity.frameNo += 0.2;
      } else {
        entity.frameNo += 0.5;
      }
      if (entity.frameNo < entity.shotFrames + 1) {
        nextShot.push(entity);
      } else if (entity.kind === "minion") {
        state.usedMinionSlots = state.usedMinionSlots.filter((slot) => slot !== entity.slot);
      }
    }
    state.shotEntities = nextShot;

    state.timer += 1;
  }

  renderBossRound() {
    const state = this.roundState;
    this.drawBackground(state.backgroundImage);
    if (state.boss) {
      this.drawEntity(state.boss);
    }
    for (const minion of state.minions) {
      this.drawEntity(minion);
    }
    for (const entity of state.shotEntities) {
      this.drawEntity(entity);
    }
    this.drawBossHud(state.ammo, this.score, state.health, state.boss ? state.boss.health : 0);
    this.drawCrosshair();
  }

  finishBossRound() {
    this.stopMusic();
    this.scene = "interstitial";
    const state = this.roundState;
    const healthPoints = Math.max(0, Math.floor(state.health)) * 5;
    const bossPoints = state.bossDefeated ? state.config.boss.bossBonus : 0;
    this.score += healthPoints + bossPoints;
    app.showBossSummary(state.enemiesHit, healthPoints, bossPoints, this.score, () => {
      this.stop();
      if (this.finishedHandler) {
        this.finishedHandler(this.score, state.bossDefeated);
      }
    });
  }

  drawBackground(image, clear = true) {
    if (clear) {
      this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }
    const x = -this.mouse.x;
    const y = -this.mouse.y / 2;
    this.ctx.drawImage(image, x, y);
  }

  drawEntities(entities) {
    for (const entity of entities) {
      this.drawEntity(entity);
    }
  }

  drawEntity(entity) {
    const path = entity.getCurrentImagePath();
    const image = this.assets.getImage(path);
    if (!image) {
      return;
    }

    const [screenX, screenY] = this.worldToScreen(entity.worldX, entity.worldY, image.width, image.height);
    this.ctx.save();
    if (entity.reverse && (entity.state === "alive" || entity.state === "shot")) {
      this.ctx.translate(screenX + image.width / 2, 0);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(image, -image.width / 2, screenY);
    } else if (entity.state === "despawning") {
      this.ctx.translate(screenX + image.width / 2, 0);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(image, -image.width / 2, screenY);
    } else {
      this.ctx.drawImage(image, screenX, screenY);
    }
    this.ctx.restore();
  }

  drawOffscreenWarnings(entities) {
    let left = false;
    let right = false;
    let up = false;
    let down = false;

    for (const entity of entities) {
      const image = this.assets.getImage(entity.getCurrentImagePath());
      if (!image) {
        continue;
      }
      const [x, y] = this.worldToScreen(entity.worldX, entity.worldY, image.width, image.height);

      if (x > WIDTH && !right) {
        const img = this.assets.getImage("Images/Right_Exclam.png");
        this.ctx.drawImage(img, WIDTH - img.width - EXCLAM_SPACING, clamp(y, EXCLAM_SPACING, HEIGHT - img.height - EXCLAM_SPACING));
        right = true;
      }
      if (x + image.width < 0 && !left) {
        const img = this.assets.getImage("Images/Left_Exclam.png");
        this.ctx.drawImage(img, EXCLAM_SPACING, clamp(y, EXCLAM_SPACING, HEIGHT - img.height - EXCLAM_SPACING));
        left = true;
      }
      if (y > HEIGHT && !down) {
        const img = this.assets.getImage("Images/Down_Exclam.png");
        this.ctx.drawImage(img, clamp(x, EXCLAM_SPACING, WIDTH - img.width - EXCLAM_SPACING), HEIGHT - img.height - EXCLAM_SPACING);
        down = true;
      }
      if (y + image.height < 0 && !up) {
        const img = this.assets.getImage("Images/Up_Exclam.png");
        this.ctx.drawImage(img, clamp(x, EXCLAM_SPACING, WIDTH - img.width - EXCLAM_SPACING), EXCLAM_SPACING);
        up = true;
      }
    }
  }

  drawHud(ammo, score) {
    this.ctx.fillStyle = COLORS[this.settings.crosshairColor];
    this.ctx.font = "70px Arial";
    this.ctx.fillText(`Score: ${score}`, 10, HEIGHT - 20);
    this.drawAmmo(ammo);
  }

  drawBossHud(ammo, score, health, bossHealth) {
    this.drawHud(ammo, score);
    this.ctx.fillStyle = COLORS[this.settings.crosshairColor];
    this.ctx.font = "60px Arial";
    this.ctx.fillText("Health:", 10, HEIGHT - 80);
    drawBar(this.ctx, 175, 600, Math.max(0, health) * 10, 35, COLORS.lightGray, COLORS[this.settings.crosshairColor]);

    this.ctx.fillStyle = COLORS.darkGreen;
    this.ctx.font = "35px Arial";
    this.ctx.fillText("Boss Health:", 10, 55);
    drawBar(this.ctx, 175, 25, Math.max(1, Math.max(0, bossHealth) * 10), 35, COLORS.lightGray, COLORS.darkGreen);
  }

  drawAmmo(ammo) {
    this.ctx.fillStyle = COLORS[this.settings.crosshairColor];
    this.ctx.font = "50px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(String(Math.floor(ammo)), this.mouse.x, this.mouse.y + 75);
    this.ctx.textAlign = "start";
  }

  drawCrosshair() {
    const image = this.assets.getImage(`Images/Crosshair_${capitalize(this.settings.crosshairColor)}.png`);
    this.ctx.drawImage(image, this.mouse.x - 50, this.mouse.y - 50);
  }

  worldToScreen(worldX, worldY, width, height) {
    return [worldX - width / 2 - this.mouse.x, worldY - height / 2 - this.mouse.y / 2];
  }

  handleMouseMove(x, y) {
    this.mouse.x = clamp(x, 0, WIDTH);
    this.mouse.y = clamp(y, 0, HEIGHT);
  }

  handleWheel(deltaY) {
    if (this.scene !== "round" && this.scene !== "bossRound") {
      return;
    }
    const state = this.roundState;
    if (deltaY !== 0 && state.ammo < MAX_AMMO) {
      state.ammo += 1;
    }
  }

  handleShot() {
    if (this.scene === "round") {
      this.shootStandardRound();
    } else if (this.scene === "bossRound") {
      this.shootBossRound();
    }
  }

  shootStandardRound() {
    const state = this.roundState;
    if (state.ammo < 1) {
      return;
    }
    state.ammo -= 1;
    let isEnemyShot = false;

    for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
      const enemy = state.enemies[i];
      if (enemy.state === "despawning") {
        continue;
      }
      if (this.isMouseOnEntity(enemy)) {
        isEnemyShot = true;
        this.score += enemy.points;
        state.enemiesHit[enemy.name] += enemy.points;

        const image = this.assets.getImage(enemy.getCurrentImagePath());
        const [screenX, screenY] = this.worldToScreen(enemy.worldX, enemy.worldY, image.width, image.height);
        const centerX = screenX + image.width / 2;
        const centerY = screenY + image.height / 2;
        const accuracy = (Math.abs(centerX - this.mouse.x) + Math.abs(centerY - this.mouse.y)) / 2;
        if (accuracy <= CENTER_TOLERANCE) {
          this.score += enemy.bonus;
          state.enemiesHit[enemy.name] += enemy.bonus;
        }

        this.assets.playSound(`Audio/${enemy.name}_Shot.mp3`, this.settings.volume);
        state.enemies.splice(i, 1);
        enemy.state = "shot";
        enemy.frameNo = 1;
        state.shotEnemies.push(enemy);
        state.enemyGrid.push([enemy.spawnX, enemy.spawnY]);
      }
    }

    if (!isEnemyShot) {
      this.assets.playSound("Audio/Shot.mp3", this.settings.volume);
    }
  }

  shootBossRound() {
    const state = this.roundState;
    if (state.ammo < 1) {
      return;
    }
    state.ammo -= 1;
    let isEnemyShot = false;

    for (let i = state.minions.length - 1; i >= 0; i -= 1) {
      const minion = state.minions[i];
      if (this.isMouseOnEntity(minion)) {
        isEnemyShot = true;
        this.score += minion.points;
        state.enemiesHit[minion.name] += minion.points;
        this.assets.playSound("Audio/Minion_Shot.mp3", this.settings.volume);
        state.minions.splice(i, 1);
        minion.state = "shot";
        minion.frameNo = 1;
        state.shotEntities.push(minion);
      }
    }

    if (state.boss && this.isMouseOnEntity(state.boss)) {
      isEnemyShot = true;
      state.boss.health -= GUN_POWER;
      if (state.boss.health < 0) {
        state.bossDefeated = true;
        const boss = state.boss;
        boss.state = "shot";
        boss.frameNo = 1;
        state.shotEntities.push(boss);
        state.boss = null;
      } else {
        this.score += state.config.boss.points;
        state.enemiesHit[state.config.boss.name] += state.config.boss.points;
      }
    }

    if (!isEnemyShot) {
      this.assets.playSound("Audio/Shot.mp3", this.settings.volume);
    }
  }

  isMouseOnEntity(entity) {
    const imagePath = entity.getCurrentImagePath();
    const image = this.assets.getImage(imagePath);
    if (!image) {
      return false;
    }
    const [screenX, screenY] = this.worldToScreen(entity.worldX, entity.worldY, image.width, image.height);
    return (
      this.mouse.x >= screenX &&
      this.mouse.x <= screenX + image.width &&
      this.mouse.y >= screenY &&
      this.mouse.y <= screenY + image.height
    );
  }

  pause() {
    if (this.scene !== "round" && this.scene !== "bossRound") {
      return;
    }
    this.running = false;
    app.showPause(this.settings, (settings) => {
      this.setSettings(settings);
      this.running = true;
      this.lastTime = 0;
      this.lastRenderTime = 0;
      requestAnimationFrame((time) => this.loop(time));
    }, () => {
      this.stop();
      if (this.finishedHandler) {
        this.finishedHandler(null, false);
      }
    });
  }

  stopMusic() {
    if (this.activeMusic) {
      this.activeMusic.pause();
      this.activeMusic.currentTime = 0;
      this.activeMusic = null;
    }
  }
}

class UI {
  constructor(game) {
    this.game = game;
    this.menuScreen = document.getElementById("menu-screen");
    this.gameScreen = document.getElementById("game-screen");
    this.modal = document.getElementById("modal");
    this.modalTitle = document.getElementById("modal-title");
    this.modalBody = document.getElementById("modal-body");
    this.modalActions = document.getElementById("modal-actions");
    this.bindMenu();
  }

  bindMenu() {
    this.menuScreen.addEventListener("click", async (event) => {
      const action = event.target?.dataset?.action;
      if (!action) {
        return;
      }

      if (action === "play") {
        await assetLoadPromise;
        this.showGame();
        document.body.classList.add("playing");
        this.hideModal();
        this.game.start();
        return;
      }
      if (action === "rules") {
        this.showRules();
        return;
      }
      if (action === "options") {
        this.showOptions();
        return;
      }
      if (action === "credits") {
        this.showCredits();
        return;
      }
    });
  }

  showMenu() {
    this.menuScreen.classList.add("active");
    this.gameScreen.classList.remove("active");
    document.body.classList.remove("playing");
  }

  showGame() {
    this.menuScreen.classList.remove("active");
    this.gameScreen.classList.add("active");
  }

  showModal(title, bodyHtml, actions) {
    this.modalTitle.textContent = title;
    this.modalBody.innerHTML = bodyHtml;
    this.modalActions.innerHTML = "";
    actions.forEach((action) => {
      const button = document.createElement("button");
      button.textContent = action.label;
      button.addEventListener("click", action.onClick, { once: true });
      this.modalActions.appendChild(button);
    });
    this.modal.classList.remove("hidden");
  }

  hideModal() {
    this.modal.classList.add("hidden");
    this.modalActions.innerHTML = "";
  }

  showInfo(title, bodyHtml) {
    this.showModal(title, bodyHtml, [{ label: "Close", onClick: () => this.hideModal() }]);
  }

  showRules() {
    const html = `
      <p>In every round, multiple targets appear on-screen.</p>
      <p>The objective is to shoot as many targets as possible within the round.</p>
      <p>Some targets give you more points and some take points away.</p>
      <img class="rules-shot" src="Images/gameplay.png" alt="Gameplay">
      <p class="large-text">Controls</p>
      <p>Move the crosshair with the mouse.</p>
      <p>Left click to shoot. Use the mouse wheel to reload. Press ESC to pause.</p>
    `;
    this.showModal("Game Rules", html, [{ label: "Close", onClick: () => this.hideModal() }]);
  }

  showOptions(onDone = null) {
    const { fps, volume, crosshairColor } = this.game.settings;
    const html = `
      <div class="options-grid">
        <label for="fps-input">Frames per Second:</label>
        <input id="fps-input" type="number" min="5" max="240" step="5" value="${fps}">
        <label for="volume-input">Main Volume:</label>
        <input id="volume-input" type="range" min="0" max="100" step="1" value="${Math.round(volume * 100)}">
        <label for="color-input">Crosshair Colour:</label>
        <select id="color-input">
          ${["blue", "red", "green", "yellow"]
            .map((color) => `<option value="${color}" ${color === crosshairColor ? "selected" : ""}>${capitalize(color)}</option>`)
            .join("")}
        </select>
      </div>
    `;
    this.showModal("Game Options", html, [
      {
        label: "Confirm",
        onClick: () => {
          const next = {
            fps: Number(document.getElementById("fps-input").value),
            volume: Number(document.getElementById("volume-input").value) / 100,
            crosshairColor: document.getElementById("color-input").value,
          };
          this.game.setSettings(next);
          this.hideModal();
          if (onDone) {
            onDone(next);
          }
        },
      },
      { label: "Cancel", onClick: () => this.hideModal() },
    ]);
  }

  showCredits() {
    const html = `
      <p class="large-text">Snappy Triggers</p>
      <p>Created by Alexander Shemaly</p>
      <p class="large-text">Special Thanks</p>
      <p>Stroia</p>
      <p>Logan</p>
      <p>Sam</p>
    `;
    this.showModal("Credits", html, [{ label: "Close", onClick: () => this.hideModal() }]);
  }

  showRoundIntro(config, onStart) {
    const { normal, bonus, penalty } = config.enemies;
    const html = `
      <p>Shoot the ${config.enemyType} to gain Points</p>
      <div class="modal-images-3">
        ${this.enemyCard(normal)}
        ${this.enemyCard(bonus)}
        ${this.enemyCard(penalty)}
      </div>
      <p class="help-line">Press SPACE to Start</p>
    `;
    const start = () => {
      window.removeEventListener("keydown", keyHandler);
      this.hideModal();
      onStart();
    };
    const keyHandler = (event) => {
      if (event.code === "Space") {
        start();
      }
    };
    window.addEventListener("keydown", keyHandler);
    this.showModal(`Round ${config.roundNo + 1}`, html, [{ label: "Start", onClick: start }]);
  }

  showBossIntro(config, onStart) {
    const html = `
      <p class="large-text">Final Round</p>
      <p>Defeat the Boss to gain points</p>
      <div class="modal-images-2">
        ${this.enemyCard(config.boss, 412, 300)}
        ${this.enemyCard(config.minion)}
      </div>
      <p>If you run out of Health, the level will end.</p>
      <p class="help-line">Press SPACE to Start</p>
    `;
    const start = () => {
      window.removeEventListener("keydown", keyHandler);
      this.hideModal();
      onStart();
    };
    const keyHandler = (event) => {
      if (event.code === "Space") {
        start();
      }
    };
    window.addEventListener("keydown", keyHandler);
    this.showModal("Final Round", html, [{ label: "Start", onClick: start }]);
  }

  showRoundSummary(roundNo, enemiesHit, score, onContinue) {
    const names = Object.keys(enemiesHit);
    const html = `
      <p class="large-text">Round Summary</p>
      <p class="summary-line">${names[0].replaceAll("_", " ")}s: ${enemiesHit[names[0]]}</p>
      <p class="summary-line">${names[1].replaceAll("_", " ")}s: ${enemiesHit[names[1]]}</p>
      <p class="summary-line">${names[2].replaceAll("_", " ")}s: ${enemiesHit[names[2]]}</p>
      <p class="summary-line">Total Score: ${score}</p>
      <p class="help-line">Press SPACE to Continue</p>
    `;
    const proceed = () => {
      window.removeEventListener("keydown", keyHandler);
      this.hideModal();
      onContinue();
    };
    const keyHandler = (event) => {
      if (event.code === "Space") {
        proceed();
      }
    };
    window.addEventListener("keydown", keyHandler);
    this.showModal(`End of Round ${roundNo}`, html, [{ label: "Continue", onClick: proceed }]);
  }

  showBossSummary(enemiesHit, healthPoints, bossPoints, score, onContinue) {
    const names = Object.keys(enemiesHit);
    const html = `
      <p class="large-text">Round Summary</p>
      <p class="summary-line">Points from Bossship: ${enemiesHit[names[0]]}</p>
      <p class="summary-line">Points from Spaceships: ${enemiesHit[names[1]]}</p>
      <p class="summary-line">Health bonus: ${healthPoints}</p>
      <p class="summary-line">Boss defeated bonus: ${bossPoints}</p>
      <p class="summary-line">Total Score: ${score}</p>
      <p class="help-line">Press SPACE to Continue</p>
    `;
    const proceed = () => {
      window.removeEventListener("keydown", keyHandler);
      this.hideModal();
      onContinue();
    };
    const keyHandler = (event) => {
      if (event.code === "Space") {
        proceed();
      }
    };
    window.addEventListener("keydown", keyHandler);
    this.showModal("End of Boss Round", html, [{ label: "Continue", onClick: proceed }]);
  }

  showPause(settings, onResume, onQuit) {
    const html = `
      <div class="options-grid">
        <label for="pause-fps-input">Frames per Second:</label>
        <input id="pause-fps-input" type="number" min="5" max="240" step="5" value="${settings.fps}">
        <label for="pause-volume-input">Main Volume:</label>
        <input id="pause-volume-input" type="range" min="0" max="100" step="1" value="${Math.round(settings.volume * 100)}">
        <label for="pause-color-input">Crosshair Colour:</label>
        <select id="pause-color-input">
          ${["blue", "red", "green", "yellow"]
            .map((color) => `<option value="${color}" ${color === settings.crosshairColor ? "selected" : ""}>${capitalize(color)}</option>`)
            .join("")}
        </select>
      </div>
    `;
    this.showModal("Paused", html, [
      {
        label: "Resume",
        onClick: () => {
          const next = {
            fps: Number(document.getElementById("pause-fps-input").value),
            volume: Number(document.getElementById("pause-volume-input").value) / 100,
            crosshairColor: document.getElementById("pause-color-input").value,
          };
          this.hideModal();
          onResume(next);
        },
      },
      {
        label: "Quit Game",
        onClick: () => {
          this.hideModal();
          onQuit();
          this.showMenu();
        },
      },
    ]);
  }

  enemyCard(enemy, width = null, height = null) {
    const size = width && height ? `style="width:${width}px;height:${height}px;object-fit:contain;"` : "";
    const bonusLine = enemy.bonusDescription ? `<p>${enemy.bonusDescription}</p>` : "";
    return `
      <div class="modal-card">
        <img src="Images/${enemy.name}.png" alt="${enemy.name}" ${size}>
        <p>${enemy.description}</p>
        ${bonusLine}
      </div>
    `;
  }
}

function drawBar(ctx, x, y, width, height, borderColor, fillColor) {
  const t = 3;
  ctx.fillStyle = borderColor;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y + t, width, height - t * 2);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const canvas = document.getElementById("game-canvas");
const introVideo = document.getElementById("intro-video");
const ctx = canvas.getContext("2d");
const assets = new Assets();
const assetLoadPromise = assets.load();
const game = new Game(assets, ctx);
const app = new UI(game);

if (introVideo) {
  introVideo.addEventListener("ended", () => {
    introVideo.currentTime = 0;
    introVideo.play().catch(() => {});
  });
}

game.setFinishedHandler((score, bossDefeated) => {
  app.showMenu();
  document.body.classList.remove("playing");
  if (score !== null) {
    app.showInfo("Run Complete", `<p class="large-text">Score: ${score}</p><p>${bossDefeated ? "Boss defeated" : "Boss not defeated"}</p>`);
  }
});

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
  const y = ((event.clientY - rect.top) / rect.height) * HEIGHT;
  game.handleMouseMove(x, y);
});

canvas.addEventListener("click", () => {
  game.handleShot();
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  game.handleWheel(event.deltaY);
}, { passive: false });

window.addEventListener("keydown", (event) => {
  if (event.code === "Escape") {
    game.pause();
  }
});

assetLoadPromise.catch(() => {
  app.showInfo("Asset Error", "<p>Some images or audio files could not be loaded.</p>");
});
