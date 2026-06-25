const CONFIG = {
  perspectiveMode: true,
  noVLines: 8,
  vLineSpacing: 0.2,
  noHLines: 7,
  hLineSpacing: 1 / 7,
  relativeSlideMode: true,
  slideScale: 260,
  speedX: 1.5,
  speedY: 0.8,
  speedYIncPerSecond: 0.002,
  noTiles: 16,
  noStartingTiles: 10,
  shipWidth: 0.07,
  shipHeight: 0.05,
  shipBaseY: 0.04
};

const COLORS = {
  black: "#000000",
  white: "#ffffff",
  blue: "#6d9ae3",
  overlay: "rgba(0, 0, 0, 0.58)",
  infoOverlay: "rgba(0, 0, 0, 0.42)"
};

const TITLE_SIZE = 0.15;
const TITLE_LEVEL = 0.35;
const BTN_WIDTH = 0.25;
const BTN_HEIGHT = 0.2;
const BTN_LEVEL = 0.575;
const BTN_TEXT_SIZE = 0.07;

const gameCanvas = document.getElementById("gameCanvas");
const infoCanvas = document.getElementById("infoCanvas");
const gameCtx = gameCanvas.getContext("2d");
const infoCtx = infoCanvas.getContext("2d");

const assets = {
  bgImage: loadImage("assets/images/bg.png"),
  shipImage: loadImage("assets/images/ship.png"),
  lowerBgImage: loadImage("assets/images/lowerBg.png"),
  audio: new Audio("assets/audio/audio.wav")
};

assets.audio.preload = "auto";
assets.audio.volume = 0.12;

const state = {
  mode: "menu",
  score: 0,
  lastTime: 0,
  currentXOffset: 0,
  currentYOffset: 0,
  currentYLoop: 0,
  speedY: CONFIG.speedY,
  tiles: [],
  heldKeys: new Set(),
  pointerDown: false,
  pointerReleased: false,
  pointerPosition: { x: -1, y: -1 },
  pointerPrevious: { x: -1, y: -1 },
  message: ""
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function resizeCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(rect.width * ratio));
  canvas.height = Math.max(1, Math.round(rect.height * ratio));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return {
    width: rect.width,
    height: rect.height
  };
}

function syncCanvasSizes() {
  state.gameSize = resizeCanvas(gameCanvas);
  state.infoSize = resizeCanvas(infoCanvas);
}

function getRandomInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function transformPerspective(point, perspectivePoint, height) {
  if (!CONFIG.perspectiveMode) {
    return point;
  }

  const x = point.x;
  const y = height - point.y;
  const transformedPerspectiveY = height - perspectivePoint.y;
  const linearY = Math.min((y * transformedPerspectiveY) / height, transformedPerspectiveY);
  const deltaX = x - perspectivePoint.x;
  const deltaY = transformedPerspectiveY - linearY;
  const scaleY = (deltaY / transformedPerspectiveY) ** 2;
  const transformedX = perspectivePoint.x + scaleY * deltaX;
  const transformedY = height - (transformedPerspectiveY - scaleY * transformedPerspectiveY);

  return { x: transformedX, y: transformedY };
}

function getLineXFromIndex(index, perspectivePoint, width, currentXOffset) {
  const centreX = perspectivePoint.x;
  const spacing = CONFIG.vLineSpacing * width;
  const offset = index - 0.5;
  return centreX + offset * spacing + currentXOffset;
}

function getLineYFromIndex(index, height, currentYOffset) {
  const spacingY = CONFIG.hLineSpacing * height;
  return (CONFIG.noHLines - 1 - index) * spacingY + currentYOffset;
}

function getTileCoordinates(tileX, tileY, perspectivePoint, width, height, currentXOffset, currentYOffset, currentYLoop) {
  const adjustedY = tileY - currentYLoop;
  return {
    x: getLineXFromIndex(tileX, perspectivePoint, width, currentXOffset),
    y: getLineYFromIndex(adjustedY - 1, height, currentYOffset)
  };
}

function checkShipCollisionWithTile(shipCenter, tileX, tileY, perspectivePoint, width, height, currentXOffset, currentYOffset, currentYLoop) {
  const minPoint = getTileCoordinates(tileX, tileY, perspectivePoint, width, height, currentXOffset, currentYOffset, currentYLoop);
  const maxPoint = getTileCoordinates(tileX + 1, tileY + 1, perspectivePoint, width, height, currentXOffset, currentYOffset, currentYLoop);

  return minPoint.x <= shipCenter.x &&
    shipCenter.x <= maxPoint.x &&
    maxPoint.y <= shipCenter.y &&
    shipCenter.y <= minPoint.y;
}

function checkShipCollision(tiles, shipCenter, perspectivePoint, width, height, currentXOffset, currentYOffset, currentYLoop) {
  for (const tile of tiles) {
    if (tile.y > currentYLoop + 1) {
      return false;
    }
    if (checkShipCollisionWithTile(
      shipCenter,
      tile.x,
      tile.y,
      perspectivePoint,
      width,
      height,
      currentXOffset,
      currentYOffset,
      currentYLoop
    )) {
      return true;
    }
  }
  return false;
}

function drawText(ctx, text, x, y, center, fontSize, letterSpacing, color, fontFamily) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px "${fontFamily}"`;
  ctx.textBaseline = "middle";

  const lines = String(text).split("\n");
  const lineHeight = fontSize * 1.2;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const lineWidth = measureSpacedText(ctx, line, letterSpacing);
    const startX = center ? x - lineWidth / 2 : x;
    const lineY = y + (lineIndex - (lines.length - 1) / 2) * lineHeight;
    fillSpacedText(ctx, line, startX, lineY, letterSpacing);
  }

  ctx.restore();
}

function measureSpacedText(ctx, text, letterSpacing) {
  if (!text.length) {
    return 0;
  }
  return ctx.measureText(text).width + letterSpacing * Math.max(text.length - 1, 0);
}

function fillSpacedText(ctx, text, startX, y, letterSpacing) {
  let cursorX = startX;
  for (const char of text) {
    ctx.fillText(char, cursorX, y);
    cursorX += ctx.measureText(char).width + letterSpacing;
  }
}

function drawImageCover(ctx, image, width, height) {
  const imageRatio = image.width / image.height;
  const targetRatio = width / height;

  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
}

function startNewGame() {
  state.mode = "game";
  state.score = 0;
  state.currentXOffset = 0;
  state.currentYOffset = 0;
  state.currentYLoop = 0;
  state.speedY = CONFIG.speedY;
  state.tiles = [];

  for (let i = 0; i < CONFIG.noStartingTiles; i += 1) {
    state.tiles.push({ x: 0, y: i });
  }
}

function setGameOver(score) {
  state.mode = "gameover";
  state.score = score;
}

function goToMainMenu(playSound = false) {
  state.mode = "menu";
  if (playSound) {
    assets.audio.currentTime = 0;
    assets.audio.play().catch(() => {});
  }
}

function activatePrimaryAction() {
  if (state.mode === "menu" || state.mode === "gameover") {
    startNewGame();
  }
}

function updateGame(dt) {
  const width = state.gameSize.width;
  const height = state.gameSize.height;
  const perspectivePoint = { x: width * 0.5, y: height * 0.25 };

  if (state.heldKeys.has("left")) {
    state.currentXOffset += width * CONFIG.speedX * dt;
  }
  if (state.heldKeys.has("right")) {
    state.currentXOffset -= width * CONFIG.speedX * dt;
  }

  if (CONFIG.relativeSlideMode && state.pointerDown) {
    const drag = getPointerDragged();
    state.currentXOffset -= CONFIG.slideScale * width * drag.x * dt;
  } else {
    state.pointerPrevious = { x: state.pointerPosition.x, y: state.pointerPosition.y };
  }

  state.speedY += dt * CONFIG.speedYIncPerSecond;
  state.currentYOffset += state.speedY * height * dt;

  const spacingY = CONFIG.hLineSpacing * height;
  while (state.currentYOffset >= spacingY) {
    state.currentYOffset -= spacingY;
    state.currentYLoop += 1;
  }

  for (let i = state.tiles.length - 1; i >= 0; i -= 1) {
    if (state.tiles[i].y < state.currentYLoop) {
      state.tiles.splice(i, 1);
    }
  }

  const startIndex = -(CONFIG.noVLines / 2) + 1;
  const endIndex = startIndex + CONFIG.noVLines - 1;

  let lastX = 0;
  let lastY = 0;
  if (state.tiles.length > 0) {
    const lastTile = state.tiles[state.tiles.length - 1];
    lastX = lastTile.x;
    lastY = lastTile.y + 1;
  }

  for (let i = state.tiles.length; i <= CONFIG.noTiles; i += 1) {
    let randomDirection = getRandomInt(0, 2);
    if (lastX <= startIndex) {
      randomDirection = 1;
    }
    if (lastX >= endIndex - 1) {
      randomDirection = 2;
    }

    state.tiles.push({ x: lastX, y: lastY });

    if (randomDirection === 1) {
      lastX += 1;
      state.tiles.push({ x: lastX, y: lastY });
      lastY += 1;
      state.tiles.push({ x: lastX, y: lastY });
    } else if (randomDirection === 2) {
      lastX -= 1;
      state.tiles.push({ x: lastX, y: lastY });
      lastY += 1;
      state.tiles.push({ x: lastX, y: lastY });
    }

    lastY += 1;
  }

  const centreX = width / 2;
  const baseY = height - CONFIG.shipBaseY * height;
  const shipHeight = CONFIG.shipHeight * height;
  const shipCenter = { x: centreX, y: baseY - shipHeight / 2 };

  if (!checkShipCollision(
    state.tiles,
    shipCenter,
    perspectivePoint,
    width,
    height,
    state.currentXOffset,
    state.currentYOffset,
    state.currentYLoop
  )) {
    setGameOver(state.currentYLoop + 1);
  }
}

function getPointerDragged() {
  const current = state.pointerDown ? state.pointerPosition : { x: -1, y: -1 };
  let deltaX = current.x - state.pointerPrevious.x;
  let deltaY = current.y - state.pointerPrevious.y;

  if (current.x === -1 || state.pointerPrevious.x === -1) {
    deltaX = 0;
    deltaY = 0;
  }

  state.pointerPrevious = { x: current.x, y: current.y };
  return { x: deltaX, y: deltaY };
}

function renderMenu(title, buttonText, infoText, message = "") {
  const { width, height } = state.gameSize;
  gameCtx.clearRect(0, 0, width, height);
  drawImageCover(gameCtx, state.bgImage, width, height);
  gameCtx.fillStyle = COLORS.overlay;
  gameCtx.fillRect(0, 0, width, height);

  drawText(gameCtx, title, width * 0.5, TITLE_LEVEL * height, true, TITLE_SIZE * height, 0.03 * width, COLORS.white, "Pirulen");

  let offset = 0;
  if (message) {
    drawText(gameCtx, message, width * 0.5, 0.55 * height, true, BTN_TEXT_SIZE * height, 0.001 * width, COLORS.white, "Zekton");
    offset = 0.15 * height;
  }

  gameCtx.fillStyle = COLORS.blue;
  gameCtx.fillRect((0.5 - BTN_WIDTH / 2) * width, BTN_LEVEL * height + offset, BTN_WIDTH * width, BTN_HEIGHT * height);
  drawText(gameCtx, buttonText, width * 0.5, 0.675 * height + offset, true, BTN_TEXT_SIZE * height, 0.001 * width, COLORS.white, "Zekton");

  if (message === "") {
    drawText(
      gameCtx,
      "C++/Nintendo 3DS original by Alexander Shemaly (2024) • Browser remake by Codex (2026)",
      width * 0.025,
      height * 0.955,
      false,
      0.036 * height,
      0.0008 * width,
      COLORS.white,
      "Zekton"
    );
  }

  renderInfoPanel(infoText, "");
}

function renderInfoPanel(infoText, footerText) {
  const { width, height } = state.infoSize;
  infoCtx.clearRect(0, 0, width, height);
  drawImageCover(infoCtx, state.lowerBgImage, width, height);
  infoCtx.fillStyle = COLORS.infoOverlay;
  infoCtx.fillRect(0, 0, width, height);
  drawText(infoCtx, infoText, width * 0.5, height * 0.5, true, 0.16 * height, 0.001 * width, COLORS.white, "Zekton");

  if (footerText) {
    drawText(infoCtx, footerText, width * 0.025, height * 0.88, false, 0.12 * height, 0.001 * width, COLORS.white, "Zekton");
  }
}

function renderGame() {
  const width = state.gameSize.width;
  const height = state.gameSize.height;
  const perspectivePoint = { x: width * 0.5, y: height * 0.25 };
  const startIndex = -(CONFIG.noVLines / 2) + 1;
  const endIndex = startIndex + CONFIG.noVLines - 1;

  gameCtx.clearRect(0, 0, width, height);
  drawImageCover(gameCtx, state.bgImage, width, height);

  gameCtx.strokeStyle = COLORS.white;
  gameCtx.lineWidth = 2;

  for (let i = startIndex; i < startIndex + CONFIG.noVLines; i += 1) {
    const x = getLineXFromIndex(i, perspectivePoint, width, state.currentXOffset);
    const start = transformPerspective({ x, y: 0 }, perspectivePoint, height);
    const end = transformPerspective({ x, y: height }, perspectivePoint, height);

    gameCtx.beginPath();
    gameCtx.moveTo(start.x, start.y);
    gameCtx.lineTo(end.x, end.y);
    gameCtx.stroke();
  }

  const xMin = getLineXFromIndex(startIndex, perspectivePoint, width, state.currentXOffset);
  const xMax = getLineXFromIndex(endIndex, perspectivePoint, width, state.currentXOffset);

  for (let i = 0; i < CONFIG.noHLines; i += 1) {
    const lineY = getLineYFromIndex(i, height, state.currentYOffset);
    const start = transformPerspective({ x: xMin, y: lineY }, perspectivePoint, height);
    const end = transformPerspective({ x: xMax, y: lineY }, perspectivePoint, height);

    gameCtx.beginPath();
    gameCtx.moveTo(start.x, start.y);
    gameCtx.lineTo(end.x, end.y);
    gameCtx.stroke();
  }

  gameCtx.fillStyle = COLORS.white;
  for (let i = 0; i < Math.min(CONFIG.noTiles, state.tiles.length); i += 1) {
    const tile = state.tiles[i];
    const pMin = getTileCoordinates(
      tile.x,
      tile.y,
      perspectivePoint,
      width,
      height,
      state.currentXOffset,
      state.currentYOffset,
      state.currentYLoop
    );
    const pMax = getTileCoordinates(
      tile.x + 1,
      tile.y + 1,
      perspectivePoint,
      width,
      height,
      state.currentXOffset,
      state.currentYOffset,
      state.currentYLoop
    );

    const p1 = transformPerspective({ x: pMin.x, y: pMin.y }, perspectivePoint, height);
    const p2 = transformPerspective({ x: pMin.x, y: pMax.y }, perspectivePoint, height);
    const p3 = transformPerspective({ x: pMax.x, y: pMax.y }, perspectivePoint, height);
    const p4 = transformPerspective({ x: pMax.x, y: pMin.y }, perspectivePoint, height);

    gameCtx.beginPath();
    gameCtx.moveTo(p1.x, p1.y);
    gameCtx.lineTo(p2.x, p2.y);
    gameCtx.lineTo(p3.x, p3.y);
    gameCtx.lineTo(p4.x, p4.y);
    gameCtx.closePath();
    gameCtx.fill();
  }

  const centreX = width / 2;
  const baseY = height - CONFIG.shipBaseY * height;
  const shipHalfWidth = (CONFIG.shipWidth * width) / 2;
  const shipHeight = CONFIG.shipHeight * height;
  gameCtx.drawImage(
    state.shipImage,
    centreX - shipHalfWidth,
    baseY - shipHeight * 2.5,
    shipHalfWidth * 2.5,
    shipHeight * 2.5
  );

  drawText(gameCtx, `Score: ${state.currentYLoop + 1}`, 0.025 * width, 0.05 * height, false, 0.07 * height, 0.001 * width, COLORS.white, "Zekton");
  renderInfoPanel("Use A / D or drag on the screen\nto move the Ship", "");
}

function frame(timestamp) {
  if (!state.lastTime) {
    state.lastTime = timestamp;
  }
  const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05);
  state.lastTime = timestamp;

  if (state.mode === "game") {
    updateGame(dt);
    renderGame();
  } else if (state.mode === "menu") {
    renderMenu("STARGLIDE", "START", "Press Space or tap the screen to Start");
  } else if (state.mode === "gameover") {
    renderMenu("GAME OVER", "RESTART", "Press Space to play again\nor click here to go back", `Your score was: ${state.score}`);
  }

  state.pointerReleased = false;
  requestAnimationFrame(frame);
}

function normalisePointerPosition(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height
  };
}

function handlePointerDown(event, canvas) {
  state.pointerDown = true;
  state.pointerPosition = normalisePointerPosition(event, canvas);
  state.pointerPrevious = { x: state.pointerPosition.x, y: state.pointerPosition.y };
}

function handlePointerMove(event, canvas) {
  if (!state.pointerDown) {
    return;
  }
  state.pointerPosition = normalisePointerPosition(event, canvas);
}

function releasePointer() {
  state.pointerDown = false;
  state.pointerReleased = true;
  state.pointerPosition = { x: -1, y: -1 };
  state.pointerPrevious = { x: -1, y: -1 };
}

function bindInput() {
  window.addEventListener("keydown", (event) => {
    if (event.code === "KeyA" || event.code === "ArrowLeft") {
      state.heldKeys.add("left");
    }
    if (event.code === "KeyD" || event.code === "ArrowRight") {
      state.heldKeys.add("right");
    }
    if (event.code === "Space") {
      event.preventDefault();
      activatePrimaryAction();
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.code === "KeyA" || event.code === "ArrowLeft") {
      state.heldKeys.delete("left");
    }
    if (event.code === "KeyD" || event.code === "ArrowRight") {
      state.heldKeys.delete("right");
    }
  });

  gameCanvas.addEventListener("pointerdown", (event) => {
    handlePointerDown(event, gameCanvas);
    if (state.mode === "menu" || state.mode === "gameover") {
      activatePrimaryAction();
    }
  });

  gameCanvas.addEventListener("pointermove", (event) => {
    handlePointerMove(event, gameCanvas);
  });

  gameCanvas.addEventListener("pointerup", releasePointer);
  gameCanvas.addEventListener("pointercancel", releasePointer);
  gameCanvas.addEventListener("pointerleave", releasePointer);

  infoCanvas.addEventListener("pointerdown", (event) => {
    if (state.mode === "game") {
      handlePointerDown(event, infoCanvas);
      return;
    }

    if (state.mode === "menu") {
      startNewGame();
      return;
    }

    if (state.mode === "gameover") {
      goToMainMenu(true);
    }
  });

  infoCanvas.addEventListener("pointermove", (event) => {
    handlePointerMove(event, infoCanvas);
  });

  infoCanvas.addEventListener("pointerup", releasePointer);
  infoCanvas.addEventListener("pointercancel", releasePointer);
  infoCanvas.addEventListener("pointerleave", releasePointer);

  window.addEventListener("resize", syncCanvasSizes);
}

async function boot() {
  const [bgImage, shipImage, lowerBgImage] = await Promise.all([
    assets.bgImage,
    assets.shipImage,
    assets.lowerBgImage,
    document.fonts.load('16px "Pirulen"'),
    document.fonts.load('16px "Zekton"')
  ]);

  state.bgImage = bgImage;
  state.shipImage = shipImage;
  state.lowerBgImage = lowerBgImage;

  syncCanvasSizes();
  bindInput();
  requestAnimationFrame(frame);
}

boot().catch((error) => {
  console.error("Failed to load STARGLIDE assets.", error);
});
