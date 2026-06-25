const FPS = 60;
const BLUE = "#0d4ccc";

const game = document.getElementById("game");
const dynamicLayer = document.getElementById("dynamicLayer");

const elements = {
  homeBG: document.getElementById("homeBG"),
  waterBG: document.getElementById("waterBG"),
  bg: document.getElementById("bg"),
  islandOutline: document.getElementById("islandOutline"),
  island: document.getElementById("island"),
  deck: document.getElementById("deck"),
  heightBar: document.getElementById("heightBar"),
  arrowHead: document.getElementById("arrowHead"),
  propeller: document.getElementById("propeller"),
  planeSprite: document.getElementById("planeSprite"),
  startImg: document.getElementById("startImg"),
  finishImg: document.getElementById("finishImg"),
  youWinImg: document.getElementById("youWinImg"),
  bigPlane: document.getElementById("bigPlane"),
  howToBG: document.getElementById("howToBG"),
  flyingPlane: document.getElementById("flyingPlane"),
  menuTitle: document.getElementById("menuTitle"),
  menuButtons: document.getElementById("menuButtons"),
  playBtn: document.getElementById("playBtn"),
  infoBtn: document.getElementById("infoBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  pauseImg: document.getElementById("pauseImg"),
  hud: document.getElementById("hud"),
  distanceLabel: document.getElementById("distanceLabel"),
  scoreLabel: document.getElementById("scoreLabel"),
  altLabel: document.getElementById("altLabel"),
  pauseOverlay: document.getElementById("pauseOverlay"),
  resumeBtn: document.getElementById("resumeBtn"),
  quitBtn: document.getElementById("quitBtn"),
  summaryOverlay: document.getElementById("summaryOverlay"),
  summaryDistance: document.getElementById("summaryDistance"),
  summaryScore: document.getElementById("summaryScore"),
  summaryBonus: document.getElementById("summaryBonus"),
  summaryTotal: document.getElementById("summaryTotal"),
  playAgainBtn: document.getElementById("playAgainBtn"),
  returnMenuBtn: document.getElementById("returnMenuBtn")
};

const sounds = createAudioMap();

const ITEM_X_VALUES = Array.from({ length: 9 }, (_, index) => (index + 1) / 10);
const ITEM_Y_VALUES = Array.from({ length: 7 }, (_, index) => (index + 3) / 10);

const CLOUDS = {
  "images/cloud.png": 0.7,
  "images/thunderCloud.png": 0.1,
  "images/rainCloud.png": 0.1,
  "images/windCloud.png": 0.1
};

const TOOLS = {
  "images/fuel.png": 0.5,
  "images/healthpack.png": 0.2,
  "images/tnt.png": 0.15,
  "images/bomb.png": 0.15
};

const ITEM_CHOICES = [
  {
    item: CLOUDS,
    goodAudio: "swoosh",
    badAudio: "zapOuch",
    shotGoodAudio: "notGood",
    shotBadAudio: "puff"
  },
  {
    item: TOOLS,
    goodAudio: "veryNice",
    badAudio: "explosionOuch",
    shotGoodAudio: "notGood",
    shotBadAudio: "explosion"
  }
];

const ENEMY_CHOICES = [
  ["images/enemyA10.png", "images/deadA10.png", true],
  ["images/enemySpitfire.png", "images/deadSpitfire.png", true],
  ["images/balloonRed.png", "images/balloonRedPop.png", false],
  ["images/balloonYellow.png", "images/balloonYellowPop.png", false],
  ["images/balloonGreen.png", "images/balloonGreenPop.png", false]
];

const INITIAL_PLANE_REL_Y = 1170 * (0.3 / 2.5) / 540;

const state = {
  scene: "menu",
  lastFrame: 0,
  menuTime: 0,
  timeCounter: 0,
  timeCounterEnemy: 0,
  difficultyCounter: 0,
  animationCounter: 0,
  animationX: 0.3,
  animationY: 0.4,
  animationMinX: 0.2,
  animationMaxX: 0.4,
  animationMinY: 0.3,
  animationMaxY: 0.5,
  moveX: randomMenuVector(),
  moveY: randomMenuVector(),
  animationUpdate: 3,
  animationChance: 0.7,
  homeBtnDisabled: false,
  inGameBtnDisabled: true,
  planeHeight: 1,
  planeWidth: 0.3,
  planeHeightUnit: 0.3 / 2.5,
  planeHorSpeed: 0.008,
  planeVerSpeed: 0.01,
  angleSpeed: 0.1,
  planeRelX: 0.5,
  planeRelY: INITIAL_PLANE_REL_Y,
  planeAngle: 0,
  deckHeight: 0.1,
  propellerAngle: 0,
  propellerAcceleration: 0.001,
  pilotHeight: 0.7,
  pilotJumpHeight: 0.001,
  pilotItemArea: 0.05,
  getInPosition: false,
  itemChance: 0.8,
  itemSpawnRate: 4,
  itemSpawnBase: 4,
  increaseRate: 0.02,
  itemMultiplier: -1,
  rateOfChange: 0.005,
  itemMinSize: 0.17,
  itemMaxSize: 0.27,
  enemyChance: 0.8,
  enemyShootRate: 3,
  enemyBulletSpeed: 0.03,
  enemyBulletSize: 0.04,
  cloudChance: 0.7,
  enemyMinSize: 0.1,
  enemyMaxSize: 0.25,
  journeySize: 10000,
  distanceTravelled: 0,
  totalScore: 0,
  maxAltitude: 1000,
  shootDelay: 0.2,
  shootCounter: 0,
  bulletSize: 0.06,
  bulletSpeed: 0.2,
  bulletUpthrust: 0.01,
  playingGame: false,
  inPosition: false,
  gifShown: false,
  howToPlayMenu: false,
  howToPlayReturn: false,
  pausedScene: null,
  menuInteractionBlockedUntil: 0,
  prevTouchX: null,
  prevTouchY: null,
  keys: new Set(),
  planeShots: [],
  enemyBullets: [],
  itemList: [],
  enemyList: [],
  shotEnemies: [],
  itemXRange: [...ITEM_X_VALUES],
  itemYRange: [...ITEM_Y_VALUES],
  pilot: null,
  endPlaneX: 0.2,
  backgroundLoops: []
};

function createAudioMap() {
  const config = {
    mainTheme: { file: "audio/mainTheme.ogg", loop: true, volume: 1 },
    propellerStartUp: { file: "audio/propellerStartUp.ogg", volume: 0.1 },
    propellerFlying: { file: "audio/propellerFlying.ogg", loop: true, volume: 0.1 },
    start: { file: "audio/start.ogg" },
    shoot: { file: "audio/shoot.ogg" },
    crash: { file: "audio/crash.ogg" },
    results: { file: "audio/results.ogg", loop: true, volume: 0.2 },
    winTheme: { file: "audio/winTheme.ogg", loop: true },
    enemyShot: { file: "audio/enemyShot.ogg" },
    planeFall: { file: "audio/planeFall.ogg", volume: 0.3 },
    bulletHit: { file: "audio/bulletHit.ogg" },
    pop: { file: "audio/pop.ogg" },
    swoosh: { file: "audio/swoosh.ogg" },
    zapOuch: { file: "audio/zapOuch.ogg" },
    notGood: { file: "audio/notGood.ogg" },
    puff: { file: "audio/puff.ogg" },
    veryNice: { file: "audio/veryNice.ogg" },
    explosionOuch: { file: "audio/explosionOuch.ogg" },
    explosion: { file: "audio/explosion.ogg" }
  };

  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => {
      const audio = new Audio(value.file);
      audio.loop = Boolean(value.loop);
      audio.volume = value.volume ?? 1;
      return [key, audio];
    })
  );
}

function playSound(name, restart = true) {
  const sound = sounds[name];
  if (!sound) {
    return;
  }
  if (restart) {
    sound.currentTime = 0;
  }
  sound.play().catch(() => {});
}

function stopSound(name) {
  const sound = sounds[name];
  if (!sound) {
    return;
  }
  sound.pause();
  sound.currentTime = 0;
}

function stopLoop(name) {
  const sound = sounds[name];
  if (!sound) {
    return;
  }
  sound.pause();
}

function randomMenuVector() {
  return (Math.random() < 0.5 ? -1 : 1) * randomInt(4, 10) / 200;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function weightedChoice(weightMap) {
  const pool = [];
  Object.entries(weightMap).forEach(([key, weight]) => {
    for (let i = 0; i < Math.round(weight * 100); i += 1) {
      pool.push(key);
    }
  });
  return choice(pool);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setVisible(element, visible) {
  element.classList.toggle("visible", visible);
  element.classList.toggle("hidden", !visible);
}

function setPosition(element, centerX, centerY, width, height) {
  element.style.left = `${(centerX - width / 2) * 100}%`;
  element.style.top = `${(1 - centerY - height / 2) * 100}%`;
  element.style.width = `${width * 100}%`;
  element.style.height = `${height * 100}%`;
}

function createSprite(src, className, width, height, x, y, alpha = 0.5) {
  const img = document.createElement("img");
  img.src = src;
  img.className = className;
  img.style.opacity = String(alpha);
  img.style.objectFit = "contain";
  dynamicLayer.appendChild(img);
  setPosition(img, x, y, width, height);
  return img;
}

function removeSprite(sprite) {
  if (sprite?.el?.parentNode) {
    sprite.el.parentNode.removeChild(sprite.el);
  } else if (sprite?.parentNode) {
    sprite.parentNode.removeChild(sprite);
  }
}

function clearDynamicLayer() {
  dynamicLayer.replaceChildren();
  state.itemList = [];
  state.enemyList = [];
  state.enemyBullets = [];
  state.planeShots = [];
  state.shotEnemies = [];
  state.pilot = null;
}

function init() {
  const isTouch = matchMedia("(pointer: coarse)").matches;
  elements.howToBG.src = isTouch ? "images/howToPlayImageMobile.png" : "images/howToPlayImagePC.png";
  bindEvents();
  updateStaticPositions();
  playSound("mainTheme", false);
  requestAnimationFrame(loop);
}

function bindEvents() {
  elements.playBtn.addEventListener("click", () => {
    if (!state.homeBtnDisabled && performance.now() >= state.menuInteractionBlockedUntil) {
      playGame();
    }
  });

  elements.infoBtn.addEventListener("click", () => {
    if (!state.homeBtnDisabled && performance.now() >= state.menuInteractionBlockedUntil) {
      showHowTo();
    }
  });

  elements.howToBG.addEventListener("pointerdown", (event) => {
    if (!state.howToPlayMenu) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    hideHowTo(true);
  });

  elements.pauseBtn.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  elements.pauseBtn.addEventListener("click", () => {
    if (!state.inGameBtnDisabled) {
      pauseGame();
    }
  });

  elements.resumeBtn.addEventListener("click", unPauseGame);
  elements.quitBtn.addEventListener("click", quitGame);
  elements.playAgainBtn.addEventListener("click", restartGame);
  elements.returnMenuBtn.addEventListener("click", quitGame);

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  game.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);
  game.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", updateStaticPositions);
}

function onKeyDown(event) {
  if ((state.scene === "game" || state.scene === "preflight") && elements.pauseOverlay.style.display !== "block") {
    const key = event.key.toLowerCase();
    if (["arrowleft", "a"].includes(key)) {
      state.keys.add("left");
    }
    if (["arrowright", "d"].includes(key)) {
      state.keys.add("right");
    }
    if (["arrowup", "w"].includes(key)) {
      state.keys.add("up");
    }
    if (["arrowdown", "s"].includes(key)) {
      state.keys.add("down");
    }
    if (event.code === "Space") {
      state.keys.add("spacebar");
      event.preventDefault();
    }
    if (event.key.toLowerCase() === "p") {
      pauseGame();
    }
  }

  if (event.key === "Escape") {
    if (state.howToPlayMenu) {
      hideHowTo();
    } else if ((state.scene === "game" || state.scene === "preflight") && elements.pauseOverlay.style.display === "block") {
      unPauseGame();
    }
  }
}

function onKeyUp(event) {
  const key = event.key.toLowerCase();
  if (["arrowleft", "a"].includes(key)) {
    state.keys.delete("left");
  }
  if (["arrowright", "d"].includes(key)) {
    state.keys.delete("right");
  }
  if (["arrowup", "w"].includes(key)) {
    state.keys.delete("up");
  }
  if (["arrowdown", "s"].includes(key)) {
    state.keys.delete("down");
  }
  if (event.code === "Space") {
    state.keys.delete("spacebar");
  }
}

function relativePointer(event) {
  const rect = game.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / rect.width,
    y: 1 - (event.clientY - rect.top) / rect.height
  };
}

function onPointerDown(event) {
  if (event.target.closest("#pauseBtn")) {
    return;
  }

  if (!state.playingGame) {
    return;
  }

  const point = relativePointer(event);
  if (point.x > 0.6) {
    state.keys.add("spacebar");
  } else if (point.x < 0.4) {
    state.keys.add("arrows");
    state.prevTouchX = point.x;
    state.prevTouchY = point.y;
  }
}

function onPointerUp() {
  state.keys.delete("spacebar");
  state.keys.delete("arrows");
  state.prevTouchX = null;
  state.prevTouchY = null;
}

function onPointerMove(event) {
  if (!state.playingGame || !state.keys.has("arrows")) {
    return;
  }

  const point = relativePointer(event);
  if (point.x >= 0.4) {
    return;
  }

  if (state.prevTouchX !== null && state.prevTouchY !== null) {
    const dX = point.x - state.prevTouchX;
    const dY = point.y - state.prevTouchY;

    const nextX = state.planeRelX + dX * 2 * (state.planeHorSpeed / 0.008);
    const nextY = state.planeRelY + dY * 2 * (state.planeVerSpeed / 0.01);

    if (nextX > state.planeWidth / 4 && nextX < 1 - state.planeWidth / 4) {
      state.planeRelX = nextX;
      state.planeAngle += dX * 40 * (state.angleSpeed / 0.1);
    }
    if (nextY > state.planeHeightUnit / 2 && nextY < 1 - state.planeHeightUnit / 2) {
      state.planeRelY = nextY;
    }
  }

  state.prevTouchX = point.x;
  state.prevTouchY = point.y;
}

function playGame() {
  state.homeBtnDisabled = true;
  state.scene = "preflight";
  state.timeCounter = 0;
  state.getInPosition = false;
  state.playingGame = false;
  state.inPosition = false;
  state.gifShown = false;
  state.itemMultiplier = -1;
  state.endPlaneX = 0.2;
  elements.playBtn.disabled = true;
  elements.infoBtn.disabled = true;

  stopLoop("mainTheme");
  hideMenu();
  hideHowTo();
  setVisible(elements.waterBG, false);
  setVisible(elements.bigPlane, false);
  setVisible(elements.youWinImg, false);
  setVisible(elements.finishImg, false);
  setVisible(elements.startImg, false);
  elements.summaryOverlay.style.display = "none";
  elements.pauseOverlay.style.display = "none";
  game.classList.remove("dimmed");

  setVisible(elements.bg, true);
  setVisible(elements.islandOutline, true);
  setVisible(elements.island, true);
  setVisible(elements.deck, true);
  setVisible(elements.propeller, true);
  setVisible(elements.planeSprite, true);
  setVisible(elements.pauseBtn, true);
  setVisible(elements.pauseImg, true);
  elements.pauseBtn.disabled = false;
  elements.planeSprite.src = "images/behindEmpty.png";
  elements.planeSprite.style.opacity = "1";
  state.inGameBtnDisabled = false;

  state.pilot = {
    el: createSprite("images/pilotWalk1.png", "pilot-sprite", 0.18, state.pilotHeight, 1, 0.2, 1),
    x: 1,
    y: 0.2,
    height: state.pilotHeight
  };
  state.pilot.el.style.zIndex = "22";
}

function showHowTo() {
  state.howToPlayMenu = true;
  state.homeBtnDisabled = true;
  elements.playBtn.disabled = true;
  elements.infoBtn.disabled = true;
  setVisible(elements.homeBG, false);
  setVisible(elements.flyingPlane, false);
  setVisible(elements.menuTitle, false);
  setVisible(elements.menuButtons, false);
  setVisible(elements.howToBG, true);
}

function hideHowTo(fromOverlayDismiss = false) {
  if (!state.howToPlayMenu) {
    return;
  }
  state.howToPlayMenu = false;
  state.homeBtnDisabled = false;
  elements.playBtn.disabled = false;
  elements.infoBtn.disabled = false;
  setVisible(elements.howToBG, false);
  if (fromOverlayDismiss) {
    state.menuInteractionBlockedUntil = performance.now() + 250;
  }
  if (state.scene === "menu") {
    setVisible(elements.homeBG, true);
    setVisible(elements.flyingPlane, true);
    setVisible(elements.menuTitle, true);
    setVisible(elements.menuButtons, true);
  }
}

function pauseGame() {
  if (!["game", "preflight"].includes(state.scene) || elements.pauseOverlay.style.display === "block") {
    return;
  }
  state.pausedScene = state.scene;
  state.scene = "paused";
  state.playingGame = false;
  state.keys.clear();
  state.inGameBtnDisabled = true;
  elements.pauseBtn.disabled = true;
  setVisible(elements.pauseImg, false);
  game.classList.add("dimmed");
  elements.pauseOverlay.style.display = "block";
}

function unPauseGame() {
  if (!state.pausedScene) {
    return;
  }
  game.classList.remove("dimmed");
  elements.pauseOverlay.style.display = "none";
  state.inGameBtnDisabled = false;
  elements.pauseBtn.disabled = false;
  setVisible(elements.pauseImg, true);
  state.scene = state.pausedScene;
  state.pausedScene = null;
  state.playingGame = state.scene === "game";
}

function quitGame() {
  stopLoop("propellerFlying");
  stopSound("propellerStartUp");
  stopLoop("results");
  stopLoop("winTheme");

  clearDynamicLayer();
  resetValues();
  showMenu();
  state.scene = "menu";
  state.playingGame = false;
  game.classList.remove("dimmed");
  elements.pauseOverlay.style.display = "none";
  elements.summaryOverlay.style.display = "none";
  playSound("mainTheme", false);
}

function restartGame() {
  stopLoop("results");
  stopLoop("winTheme");
  clearDynamicLayer();
  resetValues();
  playGame();
}

function hideMenu() {
  setVisible(elements.homeBG, false);
  setVisible(elements.flyingPlane, false);
  setVisible(elements.menuTitle, false);
  setVisible(elements.menuButtons, false);
}

function showMenu() {
  setVisible(elements.homeBG, true);
  setVisible(elements.flyingPlane, true);
  setVisible(elements.menuTitle, true);
  setVisible(elements.menuButtons, true);
  setVisible(elements.bg, false);
  setVisible(elements.islandOutline, false);
  setVisible(elements.island, false);
  setVisible(elements.deck, false);
  setVisible(elements.heightBar, false);
  setVisible(elements.arrowHead, false);
  setVisible(elements.propeller, false);
  setVisible(elements.planeSprite, false);
  setVisible(elements.startImg, false);
  setVisible(elements.finishImg, false);
  setVisible(elements.youWinImg, false);
  setVisible(elements.bigPlane, false);
  setVisible(elements.waterBG, false);
  setVisible(elements.pauseBtn, false);
  setVisible(elements.hud, false);
  elements.pauseBtn.disabled = false;
  elements.playBtn.disabled = false;
  elements.infoBtn.disabled = false;
}

function resetValues() {
  state.homeBtnDisabled = false;
  state.inGameBtnDisabled = true;
  state.timeCounter = 0;
  state.timeCounterEnemy = 0;
  state.difficultyCounter = 0;
  state.animationCounter = 0;
  state.planeHeight = 1;
  state.deckHeight = 0.1;
  state.propellerAngle = 0;
  state.getInPosition = false;
  state.planeRelX = 0.5;
  state.planeRelY = INITIAL_PLANE_REL_Y;
  state.planeAngle = 0;
  state.planeHorSpeed = 0.008;
  state.planeVerSpeed = 0.01;
  state.angleSpeed = 0.1;
  state.increaseRate = 0.02;
  state.itemSpawnRate = state.itemSpawnBase;
  state.distanceTravelled = 0;
  state.totalScore = 0;
  state.journeySize = 10000;
  state.itemXRange = [...ITEM_X_VALUES];
  state.itemYRange = [...ITEM_Y_VALUES];
  state.moveX = randomMenuVector();
  state.moveY = randomMenuVector();
  state.animationX = 0.3;
  state.animationY = 0.4;
  state.keys.clear();
  state.menuTime = 0;
  state.itemMultiplier = -1;
  state.endPlaneX = 0.2;
  state.pausedScene = null;
  state.menuInteractionBlockedUntil = 0;
  state.pilot = null;

  elements.planeSprite.src = "images/behindEmpty.png";
  resetIslandVisuals();
  updateHud();
  updateStaticPositions();
}

function loop(timestamp) {
  if (!state.lastFrame) {
    state.lastFrame = timestamp;
  }
  const dt = Math.min((timestamp - state.lastFrame) / 1000, 0.033);
  state.lastFrame = timestamp;

  if (state.scene === "menu") {
    updateMenu(dt);
  } else if (state.scene === "preflight") {
    preFlyAnimation(dt);
  } else if (state.scene === "game" && state.playingGame) {
    mainGame(dt);
  } else if (state.scene === "won") {
    wonAnimation(dt);
  } else if (state.scene === "lost") {
    lossAnimation(dt);
  }

  render();
  requestAnimationFrame(loop);
}

function updateMenu(dt) {
  state.menuTime += dt;

  if (state.animationX + state.moveX * dt >= state.animationMinX && state.animationX + state.moveX * dt <= state.animationMaxX) {
    state.animationX += state.moveX * dt;
  } else {
    state.animationX = clamp(state.animationX, state.animationMinX, state.animationMaxX);
    state.moveX = randomMenuVector();
  }

  if (state.animationY + state.moveY * dt >= state.animationMinY && state.animationY + state.moveY * dt <= state.animationMaxY) {
    state.animationY += state.moveY * dt;
  } else {
    state.animationY = clamp(state.animationY, state.animationMinY, state.animationMaxY);
    state.moveY = randomMenuVector();
  }

  if (state.menuTime >= state.animationUpdate) {
    elements.flyingPlane.src = `images/planeFront${randomInt(1, 3)}.png`;
    if (Math.random() < state.animationChance) {
      state.moveX = randomMenuVector();
      state.moveY = randomMenuVector();
    }
    state.menuTime = 0;
  }
}

function preFlyAnimation(dt) {
  state.timeCounter += dt;

  if (state.propellerAngle > 550 && state.propellerAngle < 600) {
    playSound("propellerStartUp");
  }

  if (state.propellerAngle >= 0 && state.propellerAngle < 3000) {
    let angle = (state.propellerAcceleration * state.propellerAngle ** 2 + 100) * dt;
    if (angle < 1) {
      angle = 1;
    }
    state.propellerAngle += angle;

    if (state.pilot && state.pilot.x > 0.52) {
      state.pilot.x = 1 - state.timeCounter / 10;
    } else {
      state.propellerAngle = 3001;
    }

    if (state.pilot) {
      state.pilot.height = state.pilotHeight - state.timeCounter / 15;
      const animationNo = -((Math.floor(state.pilot.x * 10)) % 2) + 2;
      state.pilot.el.src = `images/pilotWalk${animationNo}.png`;
      const jumpHeight = ((-2 * animationNo + 3) * state.pilotJumpHeight) * state.pilot.x;
      state.pilot.y += jumpHeight;
      setPosition(state.pilot.el, state.pilot.x, state.pilot.y, 0.18, state.pilot.height);
    }
  } else if (state.propellerAngle >= 3000) {
    playSound("propellerFlying", false);
    setVisible(elements.propeller, false);
    state.propellerAngle = -1;
    removeSprite(state.pilot);
    state.pilot = null;
    elements.planeSprite.src = "images/behindFlying.png";
    state.getInPosition = true;
  }

  if (state.getInPosition) {
    if (state.planeRelY < 0.5) {
      state.planeRelY += 0.12 * dt;
      state.deckHeight -= 0.24 * dt;
      state.planeHeight -= 0.18 * dt;
    } else {
      if (state.propellerAngle === -1) {
        setVisible(elements.startImg, true);
        playSound("start");
        state.propellerAngle = -2;
        state.timeCounter = 0;
      }
      if (state.timeCounter > 2) {
        setVisible(elements.startImg, false);
        state.scene = "game";
        state.playingGame = true;
        setVisible(elements.hud, true);
        setVisible(elements.deck, false);
        setVisible(elements.heightBar, true);
        setVisible(elements.arrowHead, true);
        state.timeCounter = state.itemSpawnRate;
      }
    }
  }
}

function mainGame(dt) {
  state.shootCounter -= dt;
  state.timeCounter += dt;
  state.timeCounterEnemy += dt;
  state.difficultyCounter += dt;
  state.animationCounter -= dt;

  if (state.keys.has("left") && state.planeRelX > state.planeWidth / 4) {
    state.planeRelX -= state.planeHorSpeed;
    state.planeAngle -= state.angleSpeed;
  }
  if (state.keys.has("right") && state.planeRelX < 1 - state.planeWidth / 4) {
    state.planeRelX += state.planeHorSpeed;
    state.planeAngle += state.angleSpeed;
  }
  if (state.keys.has("up") && state.planeRelY < 1 - state.planeHeightUnit / 2) {
    state.planeRelY += state.planeVerSpeed;
  }
  if (state.keys.has("down") && state.planeRelY > state.planeHeightUnit / 2) {
    state.planeRelY -= state.planeVerSpeed;
  }
  if (state.keys.has("spacebar") && state.shootCounter <= 0) {
    state.shootCounter = state.shootDelay;
    planeShoot();
  }

  if (state.timeCounter >= state.itemSpawnRate && Math.random() < state.itemChance) {
    spawnItem();
    state.timeCounter = 0;
  }
  if (state.timeCounterEnemy >= state.itemSpawnRate && Math.random() < state.itemChance) {
    if (Math.random() < state.enemyChance && state.increaseRate >= 0.03) {
      spawnEnemy();
    }
    state.timeCounterEnemy = 0;
  }
  if (state.difficultyCounter >= 10) {
    state.increaseRate += state.rateOfChange;
    state.itemSpawnRate = Math.max(1, state.itemSpawnBase - state.increaseRate * 20);
    state.difficultyCounter = 0;
  }

  let fallRate = 0;
  if (state.animationCounter < 0) {
    elements.planeSprite.src = "images/behindFlying.png";
    fallRate = (state.increaseRate / 2) * dt;
    state.planeHorSpeed = 0.008;
    state.planeVerSpeed = 0.01;
    state.angleSpeed = 0.008;
    elements.planeSprite.style.opacity = "1";
  } else if (state.itemMultiplier === -1) {
    fallRate = -state.increaseRate / 50 - dt / 25;
  } else if (state.itemMultiplier === 1) {
    fallRate = state.increaseRate * dt;
  } else if (state.itemMultiplier === -2) {
    fallRate = (state.increaseRate / 2) * dt;
    const flashState = Math.floor((state.animationCounter * 100) / (0.12 * 100)) % 2;
    elements.planeSprite.src = flashState === 0 ? "images/nothing.png" : "images/behindFlying.png";
  }

  if (state.planeHeight + fallRate > 0) {
    state.planeHeight += fallRate;
  }

  if (state.planeHeight > 1) {
    triggerLoss();
    return;
  }

  moveBullets(dt);
  moveEnemyBullets(dt, fallRate);
  moveItems(dt, fallRate);
  moveEnemies(dt, fallRate);
  enemyAnimation(dt, fallRate);
  updateDistance(dt);

  const altitude = clamp(Math.round((-state.planeHeight + 1) * state.maxAltitude), 0, state.maxAltitude);
  elements.altLabel.textContent = `Altitude: ${altitude} m`;
  updateHud();
}

function spawnItem() {
  if (!state.itemXRange.length || !state.itemYRange.length) {
    return;
  }
  const itemType = Math.random() < state.cloudChance ? CLOUDS : TOOLS;
  const src = weightedChoice(itemType);
  const x = choice(state.itemXRange);
  const y = choice(state.itemYRange);
  state.itemXRange = state.itemXRange.filter((value) => value !== x);
  state.itemYRange = state.itemYRange.filter((value) => value !== y);

  const el = createSprite(src, "world-item", 0.02, 0.02, x, y, 0.5);
  state.itemList.push({ el, src, x, y, w: 0.02, h: 0.02, box: null });
}

function spawnEnemy() {
  if (!state.itemXRange.length || !state.itemYRange.length) {
    return;
  }
  const [src, shotSrc, doesShoot] = choice(ENEMY_CHOICES);
  const xChoices = state.itemXRange.filter((value) => value >= 0.3 && value <= 0.7);
  const yChoices = state.itemYRange.filter((value) => value >= 0.4 && value <= 0.8);
  if (!xChoices.length || !yChoices.length) {
    return;
  }
  const x = choice(xChoices);
  const y = choice(yChoices);
  state.itemXRange = state.itemXRange.filter((value) => value !== x);
  state.itemYRange = state.itemYRange.filter((value) => value !== y);

  const el = createSprite(src, "enemy-item", 0.02, 0.02, x, y, 0.5);
  state.enemyList.push({ el, src, shotSrc, doesShoot, x, y, w: 0.02, h: 0.02, shootTimer: state.increaseRate * 50, box: null });
}

function planeShoot() {
  playSound("shoot");
  const el = createSprite("images/playerBullet.png", "player-bullet", state.bulletSize, state.bulletSize, state.planeRelX, state.planeRelY, 1);
  state.planeShots.push({ el, x: state.planeRelX, y: state.planeRelY, size: state.bulletSize });
}

function moveBullets(dt) {
  const remaining = [];

  for (const bullet of state.planeShots) {
    bullet.size -= state.bulletSpeed * dt;
    bullet.y += state.bulletUpthrust;
    let bulletHit = false;

    for (const item of [...state.itemList]) {
      if (insideBox(bullet.x, bullet.y, item.box)) {
        bulletHit = true;
        removeSprite(bullet.el);
        removeItem(item);
        itemCollected(item.src, "shot");
        break;
      }
    }

    if (!bulletHit) {
      for (const enemy of [...state.enemyList]) {
        if (insideBox(bullet.x, bullet.y, enemy.box)) {
          bulletHit = true;
          removeSprite(bullet.el);
          removeEnemy(enemy, true);
          break;
        }
      }
    }

    if (!bulletHit && bullet.size > 0) {
      setPosition(bullet.el, bullet.x, bullet.y, bullet.size, bullet.size);
      remaining.push(bullet);
    } else if (!bulletHit) {
      removeSprite(bullet.el);
    }
  }

  state.planeShots = remaining;
}

function moveEnemyBullets(dt, fallRate) {
  const remaining = [];

  for (const bullet of state.enemyBullets) {
    bullet.size += state.enemyBulletSpeed * dt;
    bullet.y += fallRate;

    const minX = state.planeRelX - state.planeWidth / 2;
    const minY = state.planeRelY - state.planeHeightUnit / 3;
    const maxX = state.planeRelX + state.planeWidth / 2;
    const maxY = state.planeRelY + state.planeHeightUnit / 3;

    if (bullet.x >= minX && bullet.x <= maxX && bullet.y >= minY && bullet.y <= maxY) {
      removeSprite(bullet.el);
      state.itemMultiplier = -2;
      state.animationCounter = 1.5;
      state.planeHorSpeed = 0.008 / 4;
      state.planeVerSpeed = 0.01 / 4;
      state.angleSpeed = 0.008 / 4;
      state.totalScore -= 50 * (1 + state.increaseRate);
      playSound("bulletHit");
      updateHud();
      continue;
    }

    if (bullet.size < state.enemyBulletSize) {
      setPosition(bullet.el, bullet.x, bullet.y, bullet.size, bullet.size);
      remaining.push(bullet);
    } else {
      removeSprite(bullet.el);
    }
  }

  state.enemyBullets = remaining;
}

function moveItems(dt, fallRate) {
  for (const item of [...state.itemList]) {
    if (item.w > state.itemMaxSize) {
      removeItem(item);
      continue;
    }

    item.w += state.increaseRate * dt;
    item.h += state.increaseRate * dt;
    item.y += fallRate;
    item.el.style.opacity = String(item.w > state.itemMinSize ? 1 : item.w / state.itemMinSize / 1.5);
    item.box = boxForSprite(item.x, item.y, item.w, item.h);
    setPosition(item.el, item.x, item.y, item.w, item.h);

    const t = state.pilotItemArea;
    if (
      item.w > state.itemMinSize &&
      intersectsBox(item.box, {
        minX: state.planeRelX - t,
        maxX: state.planeRelX + t,
        minY: state.planeRelY - t,
        maxY: state.planeRelY + t
      })
    ) {
      removeItem(item);
      itemCollected(item.src, "collided");
    }
  }
}

function moveEnemies(dt, fallRate) {
  for (const enemy of [...state.enemyList]) {
    if (enemy.w > state.enemyMaxSize) {
      removeEnemy(enemy, false);
      continue;
    }

    const oldW = enemy.w;
    enemy.w += state.increaseRate * dt * 0.25;
    enemy.h += state.increaseRate * dt * 0.25;
    enemy.y += fallRate;
    enemy.el.style.opacity = String(enemy.w > state.enemyMinSize ? 1 : enemy.w / state.enemyMinSize / 1.5);
    enemy.box = boxForSprite(enemy.x, enemy.y, enemy.w, enemy.h);
    setPosition(enemy.el, enemy.x, enemy.y, enemy.w, enemy.h);

    enemy.shootTimer += dt;
    if (enemy.shootTimer > state.enemyShootRate && enemy.doesShoot) {
      playSound("enemyShot");
      spawnEnemyBullet(enemy.x + 0.33 * oldW, enemy.y);
      spawnEnemyBullet(enemy.x - 0.33 * oldW, enemy.y);
      enemy.shootTimer = 0;
    }
  }
}

function spawnEnemyBullet(x, y) {
  const el = createSprite("images/enemyBullet.png", "enemy-bullet", 0.01, 0.01, x, y, 1);
  state.enemyBullets.push({ el, x, y, size: 0.01 });
}

function enemyAnimation(dt, fallRate) {
  const remaining = [];
  for (const enemy of state.shotEnemies) {
    if (enemy.fallTimer === false) {
      enemy.fallTimer = dt;
    }

    if (typeof enemy.fallTimer === "number") {
      enemy.fallTimer += dt;
      enemy.y += fallRate;
      if (enemy.fallTimer <= 2) {
        setPosition(enemy.el, enemy.x, enemy.y, enemy.w, enemy.h);
        remaining.push(enemy);
      } else {
        removeSprite(enemy.el);
      }
    } else {
      enemy.y += (-0.5 - enemy.y) * dt * 0.5;
      if (enemy.y >= -0.25) {
        setPosition(enemy.el, enemy.x, enemy.y, enemy.w, enemy.h);
        remaining.push(enemy);
      } else {
        removeSprite(enemy.el);
      }
    }
  }
  state.shotEnemies = remaining;
}

function updateDistance(dt) {
  state.distanceTravelled += dt * 10 * ((1 + state.increaseRate * 10) ** 2);
  const shownDistance = state.distanceTravelled > 1000
    ? `${(Math.round((state.distanceTravelled / 1000) * 10) / 10)} km`
    : `${Math.floor(state.distanceTravelled)} m`;

  const alpha = state.distanceTravelled / state.journeySize * 1.25 + 0.2;
  setIslandScale(alpha);
  elements.distanceLabel.textContent = `Distance Travelled: ${shownDistance}`;

  if (state.distanceTravelled >= state.journeySize) {
    triggerWin();
  }
}

function itemCollected(itemName, action) {
  let itemGood = true;
  let itemConfig = ITEM_CHOICES[0];

  for (const config of ITEM_CHOICES) {
    if (Object.prototype.hasOwnProperty.call(config.item, itemName)) {
      itemConfig = config;
      if (action === "collided") {
        itemGood = config.item[itemName] >= 0.2;
      } else if (action === "shot") {
        itemGood = config.item[itemName] < 0.2;
      }
      break;
    }
  }

  if (itemGood) {
    state.totalScore += 50 * (1 + state.increaseRate);
    elements.planeSprite.src = "images/behindGood.png";
    state.itemMultiplier = -1;
    playSound(action === "collided" ? itemConfig.goodAudio : itemConfig.shotBadAudio);
  } else {
    state.totalScore -= 50 * (1 + state.increaseRate);
    elements.planeSprite.src = "images/behindBad.png";
    state.itemMultiplier = 1;
    playSound(action === "collided" ? itemConfig.badAudio : itemConfig.shotGoodAudio);
  }

  state.animationCounter = 1.5;
  updateHud();
}

function removeItem(item) {
  state.itemList = state.itemList.filter((entry) => entry !== item);
  recycleSpawnPoint(item.x, item.y);
  removeSprite(item.el);
}

function removeEnemy(enemy, shot) {
  state.enemyList = state.enemyList.filter((entry) => entry !== enemy);
  recycleSpawnPoint(enemy.x, enemy.y);

  if (shot) {
    enemy.el.src = enemy.shotSrc;
    enemy.el.style.opacity = "1";
    state.totalScore += 200 * (1 + state.increaseRate);
    state.itemMultiplier = -1;
    state.animationCounter = 1.5;
    enemy.fallTimer = enemy.doesShoot ? true : false;
    state.shotEnemies.push(enemy);
    playSound(enemy.doesShoot ? "planeFall" : "pop");
    updateHud();
  } else {
    removeSprite(enemy.el);
  }
}

function recycleSpawnPoint(x, y) {
  if (!state.itemXRange.includes(x)) {
    state.itemXRange.push(x);
  }
  if (!state.itemYRange.includes(y)) {
    state.itemYRange.push(y);
  }
}

function triggerWin() {
  state.scene = "won";
  state.playingGame = false;
  state.inPosition = false;
  state.animationCounter = 0;
  state.planeAngle = 0;
  clearFlyingEntities();
}

function triggerLoss() {
  state.scene = "lost";
  state.playingGame = false;
  state.inPosition = false;
  state.animationCounter = 0;
  state.planeAngle = 0;
  clearFlyingEntities();
}

function clearFlyingEntities() {
  for (const item of state.itemList) {
    removeSprite(item.el);
  }
  for (const enemy of state.enemyList) {
    removeSprite(enemy.el);
  }
  for (const bullet of state.planeShots) {
    removeSprite(bullet.el);
  }
  for (const bullet of state.enemyBullets) {
    removeSprite(bullet.el);
  }
  state.itemList = [];
  state.enemyList = [];
  state.enemyBullets = [];
  state.planeShots = [];
}

function wonAnimation(dt) {
  if (!state.inPosition) {
    if (Math.abs(state.planeRelX - 0.5) < 0.01 && Math.abs(state.planeRelY - 0.5) < 0.01 && Math.abs(state.planeHeight - 0.5) < 0.01) {
      state.animationCounter += dt;
      if (state.animationCounter > 0.5) {
        state.inPosition = true;
        state.gifShown = false;
        state.animationCounter = 0;
        stopLoop("propellerFlying");
        stopSound("propellerStartUp");
        hideGameplay();
        setVisible(elements.waterBG, true);
        setVisible(elements.bigPlane, true);
        playSound("winTheme", false);
      }
    } else {
      state.planeRelX += (0.5 - state.planeRelX) * dt * 2;
      state.planeRelY += (0.5 - state.planeRelY) * dt * 2;
      state.planeHeight += (0.5 - state.planeHeight) * dt * 2;
    }
  } else if (state.endPlaneX < 0.9) {
    state.endPlaneX += dt * 0.1;
    if (state.endPlaneX > 0.4 && !state.gifShown) {
      state.gifShown = true;
      setVisible(elements.youWinImg, true);
    }
    if (state.endPlaneX > 0.7 && state.gifShown) {
      setVisible(elements.youWinImg, false);
    }
  } else {
    setVisible(elements.bigPlane, false);
    showEndScreen();
  }
}

function lossAnimation(dt) {
  state.animationCounter += dt;
  if (!state.inPosition) {
    if (Math.abs(state.planeRelX - 0.5) < 0.01 && state.planeRelY < state.planeHeightUnit + 0.01) {
      playSound("crash");
      state.inPosition = true;
      elements.planeSprite.src = "images/behindEmpty.png";
      state.pilot = {
        el: createSprite("images/pilotFalling.png", "pilot-sprite", 0.18, state.pilotHeight * 0.8, state.planeRelX, state.planeRelY + state.planeHeightUnit, 1),
        x: state.planeRelX,
        y: state.planeRelY + state.planeHeightUnit,
        height: state.pilotHeight * 0.8
      };
      state.pilot.el.style.zIndex = "24";
    } else {
      state.planeRelX += (0.5 - state.planeRelX) * dt * 4;
      state.planeRelY += (state.planeHeightUnit - state.planeRelY) * dt * 4;
    }
  } else if (state.pilot?.y < 0.7 && state.pilot.el.src.includes("pilotFalling")) {
    state.pilot.y += dt * 0.5;
    setPosition(state.pilot.el, state.pilot.x, state.pilot.y, 0.18, state.pilot.height);
    state.animationCounter = 0;
  } else if (state.animationCounter < 6) {
    if (state.pilot) {
      state.pilot.y -= dt * 0.03;
      state.pilot.el.src = "images/pilotGliding.png";
      state.pilot.height = state.pilotHeight;
      setPosition(state.pilot.el, state.pilot.x, state.pilot.y, 0.18, state.pilot.height);
    }
    if (state.animationCounter > 3) {
      setVisible(elements.finishImg, true);
    }
  } else {
    stopLoop("propellerFlying");
    stopSound("propellerStartUp");
    showEndScreen();
    playSound("results", false);
  }
}

function hideGameplay() {
  if (state.pilot) {
    removeSprite(state.pilot);
    state.pilot = null;
  }
  [
    elements.bg,
    elements.islandOutline,
    elements.island,
    elements.deck,
    elements.heightBar,
    elements.arrowHead,
    elements.propeller,
    elements.planeSprite,
    elements.pauseBtn,
    elements.hud,
    elements.startImg,
    elements.finishImg
  ].forEach((element) => setVisible(element, false));
}

function showEndScreen() {
  hideGameplay();
  setVisible(elements.homeBG, true);
  setVisible(elements.waterBG, false);
  elements.summaryDistance.textContent = `Distance Travelled: ${Math.round((state.distanceTravelled / 1000) * 10) / 10} km`;
  const score = Math.floor(state.totalScore / 5) * 5;
  elements.summaryScore.textContent = `Score: ${score}`;
  const bonus = Math.max(0, Math.floor((state.distanceTravelled / 1000) * 10) / 10 * score);
  elements.summaryBonus.textContent = `Bonus Points: ${Math.floor(bonus)}`;
  elements.summaryTotal.textContent = `Total Score: ${Math.floor(score + bonus)}`;
  elements.summaryOverlay.style.display = "block";
  game.classList.add("dimmed");
  state.scene = "summary";
}

function updateHud() {
  elements.scoreLabel.textContent = `Score: ${Math.floor(state.totalScore / 5) * 5}`;
  if (state.distanceTravelled <= 1000) {
    elements.distanceLabel.textContent = `Distance Travelled: ${Math.floor(state.distanceTravelled)} m`;
  } else {
    elements.distanceLabel.textContent = `Distance Travelled: ${Math.round((state.distanceTravelled / 1000) * 10) / 10} km`;
  }
}

function resetIslandVisuals() {
  setIslandScale(0.2);
  elements.island.style.opacity = "0.2";
}

function setIslandScale(scale) {
  elements.island.style.width = `${scale * 100}%`;
  elements.island.style.height = `${scale * 300}%`;
  elements.islandOutline.style.width = `${scale * 100}%`;
  elements.islandOutline.style.height = `${scale * 300}%`;
  elements.island.style.left = `${50 - scale * 50}%`;
  elements.islandOutline.style.left = `${50 - scale * 50}%`;
}

function boxForSprite(x, y, w, h) {
  return {
    minX: x - w / 4,
    maxX: x + w / 4,
    minY: y - h / 2,
    maxY: y + h / 2
  };
}

function insideBox(x, y, box) {
  return box && x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY;
}

function intersectsBox(a, b) {
  return a && !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}

function render() {
  setPosition(elements.flyingPlane, state.animationX, state.animationY, 0.6, 0.6);
  setPosition(elements.propeller, state.planeRelX, state.planeRelY, state.planeWidth, 1);
  setPosition(elements.planeSprite, state.planeRelX, state.planeRelY, state.planeWidth, 1);
  elements.propeller.style.transform = `rotate(${state.propellerAngle}deg)`;
  elements.planeSprite.style.transform = `rotate(${state.planeAngle}deg)`;
  elements.bg.style.top = `${(1 - (2 * state.planeHeight - 0.5) - 1.5) * 100}%`;
  elements.island.style.top = `${(1 - (2 * state.planeHeight - 0.5) - parseFloat(elements.island.style.height || "60") / 100 / 2) * 100}%`;
  elements.islandOutline.style.top = `${(1 - (2 * state.planeHeight - 0.5) - parseFloat(elements.islandOutline.style.height || "60") / 100 / 2) * 100}%`;
  elements.deck.style.top = `${(1 - state.deckHeight - 0.075) * 100}%`;
  elements.arrowHead.style.top = `${(1 - (-0.95 * state.planeHeight + 0.975) - (0.025 * 1170 / 540) / 2) * 100}%`;
  elements.bigPlane.style.left = `${(state.endPlaneX - 0.45) * 100}%`;
}

function updateStaticPositions() {
  setPosition(elements.flyingPlane, state.animationX, state.animationY, 0.6, 0.6);
  setPosition(elements.propeller, state.planeRelX, state.planeRelY, state.planeWidth, 1);
  setPosition(elements.planeSprite, state.planeRelX, state.planeRelY, state.planeWidth, 1);
  elements.deck.style.top = "82.5%";
  elements.arrowHead.style.top = "50%";
}

init();
