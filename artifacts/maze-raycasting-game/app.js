(() => {
  const WIDTH = 960;
  const HEIGHT = 720;
  const FOV = Math.PI / 2.4;
  const HALF_FOV = FOV / 2;
  const PROJECTION_DISTANCE = WIDTH / (2 * Math.tan(HALF_FOV));
  const WALL_SCALE = 0.78;
  const MAX_VIEW_DISTANCE = 24;
  const PLAYER_RADIUS = 0.28;
  const MIN_RENDER_DISTANCE = 0.3;
  const PLAYER_BASE_SPEED = 2.45;
  const STRAFE_BASE_SPEED = 2.15;
  const TURN_SPEED = 2.2;
  const DAMAGE_COOLDOWN_MS = 500;
  const ROUNDS_RESET_TO = 1;
  const BASE_MAZE_WIDTH = 8;
  const BASE_MAZE_HEIGHT = 6;

  const menuScreen = document.getElementById("menu-screen");
  const roundScreen = document.getElementById("round-screen");
  const gameScreen = document.getElementById("game-screen");
  const previewCanvas = document.getElementById("preview-canvas");
  const previewCtx = previewCanvas.getContext("2d");
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const menuVideo = document.getElementById("menu-video");
  const overlay = document.getElementById("overlay");
  const overlayKicker = document.getElementById("overlay-kicker");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayText = document.getElementById("overlay-text");
  const overlayActions = document.getElementById("overlay-actions");
  const overlayMinimapWrap = document.getElementById("overlay-minimap-wrap");
  const overlayMinimapCanvas = document.getElementById("overlay-minimap");
  const overlayMinimapCtx = overlayMinimapCanvas.getContext("2d");
  const spriteShadeCanvas = document.createElement("canvas");
  const spriteShadeCtx = spriteShadeCanvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  previewCtx.imageSmoothingEnabled = false;
  spriteShadeCtx.imageSmoothingEnabled = false;
  overlayMinimapCtx.imageSmoothingEnabled = false;
  menuVideo.playbackRate = 0.7;

  const roundLabel = document.getElementById("round-label");
  const roundText = document.getElementById("round-text");
  const roundCoins = document.getElementById("round-coins");
  const roundEnemies = document.getElementById("round-enemies");

  const hudRound = document.getElementById("hud-round");
  const hudCoins = document.getElementById("hud-coins");
  const hudHealth = document.getElementById("hud-health");

  const startCampaignButton = document.getElementById("start-campaign");
  const playRoundButton = document.getElementById("play-round");
  const backToTitleButton = document.getElementById("back-to-title");

  const assetLoaders = {
    background: () => loadImage("assets/background.png"),
    coinSheet: () => loadImage("assets/coin.png"),
    crosshair: () => loadImage("assets/crosshair.png"),
    enemy1: () => loadImage("assets/enemy1.png"),
    enemy2: () => loadImage("assets/enemy2.png"),
    wall1: () => loadImage("assets/wall1.png"),
    coinSound: () => loadAudio("assets/coin.wav", 0.2),
    hurtSound: () => loadAudio("assets/oof.wav", 0.45)
  };
  const assets = {};

  const state = {
    mode: "loading",
    round: 1,
    level: null,
    player: null,
    keys: Object.create(null),
    pointerLocked: false,
    lastFrame: 0,
    coinFrameCount: 8,
    lastDamageAt: 0,
    mousePitch: 0
  };

  const ready = Promise.all(
    Object.entries(assetLoaders).map(([key, loader]) =>
      loader().then((asset) => {
        assets[key] = asset;
      })
    )
  ).then(() => {
    state.mode = "menu";
    renderStaticFrame();
  });

  startCampaignButton.addEventListener("click", async () => {
    await ready;
    state.round = ROUNDS_RESET_TO;
    prepareRound();
  });

  backToTitleButton.addEventListener("click", () => {
    exitPointerLock();
    state.mode = "menu";
    showScreen("menu");
    hideOverlay();
  });

  playRoundButton.addEventListener("click", () => {
    startRound();
  });

  document.addEventListener("keydown", (event) => {
    state.keys[event.key.toLowerCase()] = true;

    if (event.key === "Escape" && state.mode === "playing") {
      setPaused();
    }

    if (event.key.toLowerCase() === "p" && state.mode === "playing") {
      setPaused();
    } else if (event.key.toLowerCase() === "p" && state.mode === "paused") {
      resumeRound();
    }
  });

  document.addEventListener("keyup", (event) => {
    state.keys[event.key.toLowerCase()] = false;
  });

  canvas.addEventListener("click", () => {
    if (state.mode === "playing" && !state.pointerLocked) {
      canvas.requestPointerLock();
    }
  });

  document.addEventListener("pointerlockchange", () => {
    state.pointerLocked = document.pointerLockElement === canvas;
    if (!state.pointerLocked && state.mode === "playing") {
      setPaused();
    }
  });

  document.addEventListener("mousemove", (event) => {
    if (state.mode !== "playing" || !state.pointerLocked || !state.player) {
      return;
    }
    state.player.angle += event.movementX * 0.0028;
    state.player.angle = normalizeAngle(state.player.angle);
    state.mousePitch = clamp(state.mousePitch - event.movementY * 0.65, -100, 100);
  });

  function prepareRound() {
    state.level = createLevel(state.round);
    state.player = {
      x: state.level.playerSpawn.x,
      y: state.level.playerSpawn.y,
      angle: -Math.PI / 4,
      health: 100
    };
    state.lastDamageAt = 0;
    state.mousePitch = 0;
    state.mode = "round-preview";
    updateRoundPreview();
    showScreen("round");
  }

  function startRound() {
    state.mode = "playing";
    state.lastFrame = performance.now();
    showScreen("game");
    hideOverlay();
    canvas.requestPointerLock();
    requestAnimationFrame(loop);
  }

  function loop(timestamp) {
    if (state.mode !== "playing") {
      renderStaticFrame();
      return;
    }

    const dt = Math.min((timestamp - state.lastFrame) / 1000, 0.033);
    state.lastFrame = timestamp;

    updatePlayer(dt);
    updateEnemies(dt, timestamp);
    updateCoins();
    updateHud();
    renderScene(timestamp);

    if (state.level.coins.length === 0) {
      showRoundWon();
      return;
    }

    if (state.player.health <= 0) {
      showGameOver();
      return;
    }

    requestAnimationFrame(loop);
  }

  function updatePlayer(dt) {
    const forward =
      (state.keys["w"] || state.keys["arrowup"] ? 1 : 0) -
      (state.keys["s"] || state.keys["arrowdown"] ? 1 : 0);
    const strafe =
      (state.keys["a"] ? 1 : 0) -
      (state.keys["d"] ? 1 : 0);
    const turn =
      (state.keys["arrowright"] ? 1 : 0) -
      (state.keys["arrowleft"] ? 1 : 0);

    state.player.angle = normalizeAngle(state.player.angle + turn * TURN_SPEED * dt);

    const sin = Math.sin(state.player.angle);
    const cos = Math.cos(state.player.angle);
    const dx = cos * forward * PLAYER_BASE_SPEED * dt + sin * strafe * STRAFE_BASE_SPEED * dt;
    const dy = sin * forward * PLAYER_BASE_SPEED * dt - cos * strafe * STRAFE_BASE_SPEED * dt;

    moveWithCollisions(state.player, dx, dy, PLAYER_RADIUS);
  }

  function updateEnemies(dt, timestamp) {
    for (const enemy of state.level.enemies) {
      const dx = state.player.x - enemy.x;
      const dy = state.player.y - enemy.y;
      const distance = Math.hypot(dx, dy);
      const canSeePlayer = distance < 8 && hasLineOfSight(enemy.x, enemy.y, state.player.x, state.player.y);

      if (canSeePlayer) {
        enemy.vx = (dx / Math.max(distance, 0.001)) * enemy.speed;
        enemy.vy = (dy / Math.max(distance, 0.001)) * enemy.speed;
        enemy.wanderTimer = 0;
      } else {
        enemy.wanderTimer -= dt;
        if (enemy.wanderTimer <= 0) {
          const angle = Math.random() * Math.PI * 2;
          enemy.vx = Math.cos(angle) * enemy.speed * 0.45;
          enemy.vy = Math.sin(angle) * enemy.speed * 0.45;
          enemy.wanderTimer = 1.4 + Math.random() * 2.2;
        }
      }

      moveWithCollisions(enemy, enemy.vx * dt, enemy.vy * dt, enemy.radius);

      if (distance < enemy.radius + PLAYER_RADIUS + 0.1 && timestamp - state.lastDamageAt > DAMAGE_COOLDOWN_MS) {
        state.player.health = Math.max(0, state.player.health - enemy.damage);
        state.lastDamageAt = timestamp;
        playAudio(assets.hurtSound);
      }
    }
  }

  function updateCoins() {
    state.level.coins = state.level.coins.filter((coin) => {
      const collected = Math.hypot(coin.x - state.player.x, coin.y - state.player.y) < 0.28;
      if (collected) {
        playAudio(assets.coinSound);
      }
      return !collected;
    });
  }

  function renderStaticFrame() {
    if (state.mode === "playing" && state.level) {
      renderScene(performance.now());
    }
  }

  function renderScene(timestamp) {
    drawBackground();
    const depthBuffer = drawWalls();
    drawSprites(depthBuffer, timestamp);
    drawHudDecor();
  }

  function drawBackground() {
    const bg = assets.background;
    const horizon = clamp(HEIGHT / 2 + state.mousePitch, 120, HEIGHT - 120);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const sourceWidth = Math.max(1, Math.floor((bg.width * FOV) / (Math.PI * 2)));
    let sourceX = Math.floor((normalizeAngle(state.player.angle - HALF_FOV) / (Math.PI * 2)) * bg.width);
    if (sourceX + sourceWidth <= bg.width) {
      ctx.drawImage(bg, sourceX, 0, sourceWidth, bg.height, 0, 0, WIDTH, horizon);
    } else {
      const firstWidth = bg.width - sourceX;
      const secondWidth = sourceWidth - firstWidth;
      const firstDestWidth = Math.floor((firstWidth / sourceWidth) * WIDTH);
      ctx.drawImage(bg, sourceX, 0, firstWidth, bg.height, 0, 0, firstDestWidth, horizon);
      ctx.drawImage(bg, 0, 0, secondWidth, bg.height, firstDestWidth, 0, WIDTH - firstDestWidth, horizon);
    }

    const ceilingShade = ctx.createLinearGradient(0, 0, 0, horizon);
    ceilingShade.addColorStop(0, "rgba(8, 12, 18, 0.10)");
    ceilingShade.addColorStop(1, "rgba(10, 14, 20, 0.30)");
    ctx.fillStyle = ceilingShade;
    ctx.fillRect(0, 0, WIDTH, horizon);

    const floor = ctx.createLinearGradient(0, horizon, 0, HEIGHT);
    floor.addColorStop(0, "#44413c");
    floor.addColorStop(1, "#14110f");
    ctx.fillStyle = floor;
    ctx.fillRect(0, horizon, WIDTH, HEIGHT - horizon);
  }

  function drawWalls() {
    const depthBuffer = new Array(WIDTH);
    const horizon = HEIGHT / 2 + state.mousePitch;
    for (let column = 0; column < WIDTH; column += 1) {
      const rayAngle = state.player.angle - HALF_FOV + (column / WIDTH) * FOV;
      const hit = castRay(rayAngle);
      const correctedDistance = hit.distance * Math.cos(rayAngle - state.player.angle);
      const safeDistance = Math.max(correctedDistance, MIN_RENDER_DISTANCE);
      const wallHeight = Math.min(HEIGHT * 1.65, (PROJECTION_DISTANCE / safeDistance) * WALL_SCALE);
      const top = Math.floor(horizon - wallHeight / 2);
      const texture = assets.wall1;
      const normalizedOffset = Math.min(0.999, Math.max(0.001, hit.textureOffset));
      const texX = Math.min(
        texture.width - 1,
        Math.max(0, Math.floor(normalizedOffset * texture.width))
      );

      ctx.drawImage(texture, texX, 0, 1, texture.height, column, top, 1, wallHeight);
      const distanceShade = clamp((safeDistance - 0.75) / 11, 0, 0.45);
      const sideShade = hit.side === "horizontal" ? 0.08 : 0;
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.55, distanceShade + sideShade)})`;
      ctx.fillRect(column, top, 1, wallHeight);

      depthBuffer[column] = safeDistance;
    }
    return depthBuffer;
  }

  function drawSprites(depthBuffer, timestamp) {
    const sprites = [];
    const frameWidth = assets.coinSheet.width / state.coinFrameCount;
    const coinFrame = Math.floor((timestamp / 1000) * 12) % state.coinFrameCount;

    for (const coin of state.level.coins) {
      sprites.push({
        kind: "coin",
        image: assets.coinSheet,
        sx: coinFrame * frameWidth,
        sy: 0,
        sw: frameWidth,
        sh: assets.coinSheet.height,
        x: coin.x,
        y: coin.y,
        scale: 0.42,
        verticalOffset: 0.08
      });
    }

    for (const enemy of state.level.enemies) {
      sprites.push({
        kind: "enemy",
        image: enemy.variant === 1 ? assets.enemy1 : assets.enemy2,
        sx: 0,
        sy: 0,
        sw: enemy.variant === 1 ? assets.enemy1.width : assets.enemy2.width,
        sh: enemy.variant === 1 ? assets.enemy1.height : assets.enemy2.height,
        x: enemy.x,
        y: enemy.y,
        scale: 0.5,
        verticalOffset: 0.22
      });
    }

    sprites.sort((a, b) => distanceToPlayer(b) - distanceToPlayer(a));

    for (const sprite of sprites) {
      const dx = sprite.x - state.player.x;
      const dy = sprite.y - state.player.y;
      const dirX = Math.cos(state.player.angle);
      const dirY = Math.sin(state.player.angle);
      const planeX = -dirY * Math.tan(HALF_FOV);
      const planeY = dirX * Math.tan(HALF_FOV);
      const invDet = 1 / (planeX * dirY - dirX * planeY);
      const transformX = invDet * (dirY * dx - dirX * dy);
      const transformY = invDet * (-planeY * dx + planeX * dy);

      if (transformY <= 0.1) {
        continue;
      }

      const spriteScreenX = Math.floor((WIDTH / 2) * (1 + transformX / transformY));
      const spriteHeight = Math.abs(Math.floor((PROJECTION_DISTANCE / transformY) * sprite.scale));
      const spriteWidth = Math.abs(Math.floor((PROJECTION_DISTANCE / transformY) * sprite.scale * (sprite.sw / sprite.sh)));
      const drawStartY = Math.floor(
        HEIGHT / 2 + state.mousePitch - spriteHeight / 2 + spriteHeight * (sprite.verticalOffset || 0)
      );
      const drawStartX = Math.floor(spriteScreenX - spriteWidth / 2);
      const brightness = Math.max(0.24, 1 - transformY / 12);
      const stripHeight = Math.max(1, spriteHeight);
      const stripWidth = Math.max(1, spriteWidth);

      if (spriteShadeCanvas.width !== stripWidth || spriteShadeCanvas.height !== stripHeight) {
        spriteShadeCanvas.width = stripWidth;
        spriteShadeCanvas.height = stripHeight;
        spriteShadeCtx.imageSmoothingEnabled = false;
      }
      spriteShadeCtx.clearRect(0, 0, stripWidth, stripHeight);
      spriteShadeCtx.globalCompositeOperation = "source-over";
      spriteShadeCtx.globalAlpha = 1;
      spriteShadeCtx.drawImage(
        sprite.image,
        sprite.sx,
        sprite.sy,
        sprite.sw,
        sprite.sh,
        0,
        0,
        stripWidth,
        stripHeight
      );
      if (brightness < 0.999) {
        spriteShadeCtx.globalCompositeOperation = "source-atop";
        spriteShadeCtx.fillStyle = `rgba(0, 0, 0, ${1 - brightness})`;
        spriteShadeCtx.fillRect(0, 0, stripWidth, stripHeight);
        spriteShadeCtx.globalCompositeOperation = "source-over";
      }

      for (let stripe = 0; stripe < stripWidth; stripe += 1) {
        const screenX = drawStartX + stripe;
        if (screenX < 0 || screenX >= WIDTH || transformY >= depthBuffer[screenX]) {
          continue;
        }

        ctx.drawImage(spriteShadeCanvas, stripe, 0, 1, stripHeight, screenX, drawStartY, 1, stripHeight);
      }
    }
  }

  function drawHudDecor() {
    const crosshair = assets.crosshair;
    ctx.drawImage(crosshair, WIDTH / 2 - crosshair.width / 2, HEIGHT / 2 - crosshair.height / 2);
  }

  function castRay(angle) {
    const rayDirX = Math.cos(angle);
    const rayDirY = Math.sin(angle);

    let mapX = Math.floor(state.player.x);
    let mapY = Math.floor(state.player.y);

    const deltaDistX = Math.abs(1 / (rayDirX || 0.000001));
    const deltaDistY = Math.abs(1 / (rayDirY || 0.000001));
    let stepX;
    let stepY;
    let sideDistX;
    let sideDistY;

    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (state.player.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1 - state.player.x) * deltaDistX;
    }

    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (state.player.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1 - state.player.y) * deltaDistY;
    }

    let side = "vertical";
    let iterations = 0;

    while (iterations < 128) {
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = "vertical";
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = "horizontal";
      }

      if (isWall(mapX, mapY)) {
        let distance;
        if (side === "vertical") {
          distance = (mapX - state.player.x + (1 - stepX) / 2) / (rayDirX || 0.000001);
        } else {
          distance = (mapY - state.player.y + (1 - stepY) / 2) / (rayDirY || 0.000001);
        }
        const wallX = side === "vertical"
          ? state.player.y + distance * rayDirY
          : state.player.x + distance * rayDirX;
        let textureOffset = wallX - Math.floor(wallX);
        if (side === "vertical" && rayDirX > 0) {
          textureOffset = 1 - textureOffset;
        }
        if (side === "horizontal" && rayDirY < 0) {
          textureOffset = 1 - textureOffset;
        }
        textureOffset = Math.min(0.999, Math.max(0.001, textureOffset));
        return {
          distance: Math.min(Math.abs(distance), MAX_VIEW_DISTANCE),
          textureOffset,
          side
        };
      }

      iterations += 1;
    }

    return {
      distance: MAX_VIEW_DISTANCE,
      textureOffset: 0,
      side: "vertical"
    };
  }

  function moveWithCollisions(entity, dx, dy, radius) {
    const nextX = entity.x + dx;
    const nextY = entity.y + dy;

    if (!collides(nextX, entity.y, radius)) {
      entity.x = nextX;
    }
    if (!collides(entity.x, nextY, radius)) {
      entity.y = nextY;
    }
  }

  function collides(x, y, radius) {
    const minX = Math.floor(x - radius);
    const maxX = Math.floor(x + radius);
    const minY = Math.floor(y - radius);
    const maxY = Math.floor(y + radius);

    for (let gridY = minY; gridY <= maxY; gridY += 1) {
      for (let gridX = minX; gridX <= maxX; gridX += 1) {
        if (!isWall(gridX, gridY)) {
          continue;
        }

        const nearestX = clamp(x, gridX, gridX + 1);
        const nearestY = clamp(y, gridY, gridY + 1);
        const dx = x - nearestX;
        const dy = y - nearestY;
        if (dx * dx + dy * dy < radius * radius) {
          return true;
        }
      }
    }

    return false;
  }

  function hasLineOfSight(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) * 12);
    for (let i = 1; i < steps; i += 1) {
      const t = i / steps;
      const sampleX = x1 + dx * t;
      const sampleY = y1 + dy * t;
      if (isWall(Math.floor(sampleX), Math.floor(sampleY))) {
        return false;
      }
    }
    return true;
  }

  function isWall(x, y) {
    const { grid } = state.level;
    return y < 0 || y >= grid.length || x < 0 || x >= grid[0].length || grid[y][x];
  }

  function createLevel(round) {
    const stats = {
      coins: 5 + 5 * round,
      enemies: 3 + 3 * round,
      enemySpeed: 0.72 + round * 0.16,
      enemyDamage: round
    };

    const maze = generateMaze(BASE_MAZE_WIDTH, BASE_MAZE_HEIGHT);
    const openCells = [];
    for (let y = 1; y < maze.length - 1; y += 1) {
      for (let x = 1; x < maze[0].length - 1; x += 1) {
        if (!maze[y][x]) {
          openCells.push({ x, y });
        }
      }
    }

    shuffle(openCells);

    const playerCell = openCells.shift();
    const coins = [];
    const enemies = [];

    const availableObjects = Math.min(stats.coins + stats.enemies, openCells.length);
    const coinRatio = stats.coins / (stats.coins + stats.enemies);
    let placedCoins = 0;
    let placedEnemies = 0;

    for (let i = 0; i < availableObjects; i += 1) {
      const cell = openCells.shift();
      if (placedCoins < stats.coins && placedCoins / availableObjects < coinRatio) {
        coins.push({ x: cell.x + 0.5, y: cell.y + 0.5 });
        placedCoins += 1;
      } else {
        enemies.push({
          x: cell.x + 0.5,
          y: cell.y + 0.5,
          radius: 0.16,
          speed: stats.enemySpeed,
          damage: stats.enemyDamage,
          variant: placedEnemies % 2 === 0 ? 1 : 2,
          vx: 0,
          vy: 0,
          wanderTimer: 0
        });
        placedEnemies += 1;
      }
    }

    return {
      round,
      grid: maze,
      stats: {
        coins: placedCoins,
        enemies: placedEnemies
      },
      playerSpawn: { x: playerCell.x + 0.5, y: playerCell.y + 0.5 },
      coins,
      enemies
    };
  }

  function generateMaze(cellWidth, cellHeight) {
    const width = cellWidth * 2 + 1;
    const height = cellHeight * 2 + 1;
    const maze = Array.from({ length: height }, () => Array(width).fill(true));

    const wallDirections = [
      [0, 2],
      [2, 0],
      [0, -2],
      [-2, 0]
    ];
    const moveDirections = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0]
    ];

    const startX = randomInt(cellWidth) * 2 + 1;
    const startY = randomInt(cellHeight) * 2 + 1;

    const carve = (x, y) => {
      maze[y][x] = false;
      shuffle(wallDirections);
      for (const [dx, dy] of wallDirections) {
        const nx = x + dx;
        const ny = y + dy;
        if (ny <= 0 || ny >= height - 1 || nx <= 0 || nx >= width - 1 || !maze[ny][nx]) {
          continue;
        }
        maze[y + dy / 2][x + dx / 2] = false;
        carve(nx, ny);
      }
    };

    carve(startX, startY);

    const isDeadEnd = (x, y) => {
      if (maze[y][x]) {
        return false;
      }
      let walls = 0;
      for (const [dx, dy] of moveDirections) {
        if (maze[y + dy][x + dx]) {
          walls += 1;
        }
      }
      return walls === 3;
    };

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        if (!isDeadEnd(x, y)) {
          continue;
        }
        for (const [dx, dy] of moveDirections) {
          if (maze[y + dy][x + dx]) {
            maze[y + dy][x + dx] = false;
          }
        }
      }
    }

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        if (!maze[y][x]) {
          continue;
        }
        let surroundedByOpen = true;
        for (const [dx, dy] of moveDirections) {
          if (maze[y + dy][x + dx]) {
            surroundedByOpen = false;
            break;
          }
        }
        if (surroundedByOpen) {
          maze[y][x] = false;
        }
      }
    }

    return maze;
  }

  function updateRoundPreview() {
    const { level } = state;
    roundLabel.textContent = `Round ${level.round}`;
    roundText.textContent = `Collect ${level.stats.coins} coin${level.stats.coins === 1 ? "" : "s"} and avoid ${level.stats.enemies} ${level.stats.enemies === 1 ? "enemy" : "enemies"}.`;
    roundCoins.textContent = `Coins: ${level.stats.coins}`;
    roundEnemies.textContent = `Enemies: ${level.stats.enemies}`;
    drawMinimap(previewCtx, previewCanvas, level, level.playerSpawn, {
      playerRadiusScale: 0.3,
      coinRadiusScale: 0.22,
      enemyRadiusScale: 0.26
    });
  }

  function drawMinimap(targetCtx, targetCanvas, level, player, options = {}) {
    const grid = level.grid;
    const cellSize = Math.min(targetCanvas.width / grid[0].length, targetCanvas.height / grid.length);
    const offsetX = (targetCanvas.width - grid[0].length * cellSize) / 2;
    const offsetY = (targetCanvas.height - grid.length * cellSize) / 2;
    const playerRadiusScale = options.playerRadiusScale ?? 0.24;
    const coinRadiusScale = options.coinRadiusScale ?? 0.18;
    const enemyRadiusScale = options.enemyRadiusScale ?? 0.22;
    const showPlayerDirection = options.showPlayerDirection ?? false;

    targetCtx.fillStyle = "#d0d0d0";
    targetCtx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

    for (let y = 0; y < grid.length; y += 1) {
      for (let x = 0; x < grid[0].length; x += 1) {
        if (!grid[y][x]) {
          continue;
        }
        targetCtx.fillStyle = "#0b0c10";
        targetCtx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
      }
    }

    targetCtx.fillStyle = "#f4c518";
    for (const coin of level.coins) {
      circle(targetCtx, offsetX + coin.x * cellSize, offsetY + coin.y * cellSize, Math.max(3, cellSize * coinRadiusScale));
    }

    targetCtx.fillStyle = "#c33a34";
    for (const enemy of level.enemies) {
      circle(targetCtx, offsetX + enemy.x * cellSize, offsetY + enemy.y * cellSize, Math.max(3, cellSize * enemyRadiusScale));
    }

    targetCtx.fillStyle = "#14d145";
    circle(targetCtx, offsetX + player.x * cellSize, offsetY + player.y * cellSize, Math.max(4, cellSize * playerRadiusScale));

    if (showPlayerDirection && typeof player.angle === "number") {
      targetCtx.strokeStyle = "#14d145";
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.moveTo(offsetX + player.x * cellSize, offsetY + player.y * cellSize);
      targetCtx.lineTo(
        offsetX + (player.x + Math.cos(player.angle) * 0.7) * cellSize,
        offsetY + (player.y + Math.sin(player.angle) * 0.7) * cellSize
      );
      targetCtx.stroke();
    }
  }

  function showRoundWon() {
    exitPointerLock();
    state.mode = "won";
    showOverlay({
      kicker: `Round ${state.round} Complete`,
      title: "You Win",
      text: "You collected every coin.",
      actions: [
        {
          label: "Next Round",
          className: "primary-btn",
          onClick: () => {
            state.round += 1;
            prepareRound();
          }
        },
        {
          label: "Title Screen",
          className: "ghost-btn",
          onClick: () => {
            state.mode = "menu";
            showScreen("menu");
            hideOverlay();
          }
        }
      ]
    });
  }

  function showGameOver() {
    exitPointerLock();
    state.mode = "lost";
    const collected = state.level.stats.coins - state.level.coins.length;
    showOverlay({
      kicker: "Run Failed",
      title: "Game Over",
      text: `You ran out of health. Coins collected: ${collected}/${state.level.stats.coins}.`,
      actions: [
        {
          label: "Play Again",
          className: "primary-btn",
          onClick: () => {
            state.round = ROUNDS_RESET_TO;
            prepareRound();
          }
        },
        {
          label: "Title Screen",
          className: "ghost-btn",
          onClick: () => {
            state.mode = "menu";
            showScreen("menu");
            hideOverlay();
          }
        }
      ]
    });
  }

  function setPaused() {
    if (state.mode !== "playing") {
      return;
    }
    exitPointerLock();
    state.mode = "paused";
    drawMinimap(overlayMinimapCtx, overlayMinimapCanvas, state.level, state.player, {
      showPlayerDirection: true
    });
    showOverlay({
      kicker: "Paused",
      title: "Game Paused",
      text: "Resume the current round or return to the title screen.",
      showMinimap: true,
      actions: [
        {
          label: "Resume",
          className: "primary-btn",
          onClick: resumeRound
        },
        {
          label: "Title Screen",
          className: "ghost-btn",
          onClick: () => {
            state.mode = "menu";
            showScreen("menu");
            hideOverlay();
          }
        }
      ]
    });
  }

  function resumeRound() {
    if (state.mode !== "paused") {
      return;
    }
    state.mode = "playing";
    hideOverlay();
    state.lastFrame = performance.now();
    canvas.requestPointerLock();
    requestAnimationFrame(loop);
  }

  function updateHud() {
    hudRound.textContent = `Round ${state.round}`;
    hudCoins.textContent = `Coins Left: ${state.level.coins.length}`;
    hudHealth.textContent = `Health: ${Math.max(0, Math.floor(state.player.health))}`;
  }

  function showScreen(name) {
    menuScreen.classList.toggle("hidden", name !== "menu");
    roundScreen.classList.toggle("hidden", name !== "round");
    gameScreen.classList.toggle("hidden", name !== "game");
    document.body.classList.toggle("menu-active", name === "menu");
    document.body.classList.toggle("game-active", name === "game");

    if (name === "game") {
      updateHud();
      renderScene(performance.now());
    }
  }

  function showOverlay({ kicker, title, text, actions, showMinimap = false }) {
    overlayKicker.textContent = kicker;
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    overlayActions.replaceChildren();
    overlayMinimapWrap.classList.toggle("hidden", !showMinimap);

    for (const action of actions) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = action.label;
      button.className = action.className;
      button.addEventListener("click", action.onClick);
      overlayActions.appendChild(button);
    }

    overlay.classList.remove("hidden");
    showScreen("game");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
    overlayActions.replaceChildren();
    overlayMinimapWrap.classList.add("hidden");
  }

  function exitPointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function loadAudio(src, volume) {
    return new Promise((resolve) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.volume = volume;
      const done = () => resolve(audio);
      audio.addEventListener("canplaythrough", done, { once: true });
      audio.addEventListener("error", done, { once: true });
    });
  }

  function playAudio(audio) {
    if (!audio) {
      return;
    }
    const clone = audio.cloneNode();
    clone.volume = audio.volume;
    clone.play().catch(() => {});
  }

  function circle(targetCtx, x, y, radius) {
    targetCtx.beginPath();
    targetCtx.arc(x, y, radius, 0, Math.PI * 2);
    targetCtx.fill();
  }

  function distanceToPlayer(entity) {
    return Math.hypot(entity.x - state.player.x, entity.y - state.player.y);
  }

  function normalizeAngle(angle) {
    let result = angle % (Math.PI * 2);
    if (result < 0) {
      result += Math.PI * 2;
    }
    return result;
  }

  function fractional(value) {
    return value - Math.floor(value);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }
})();
