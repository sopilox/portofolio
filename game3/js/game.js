const WIDTH = 720;
const HEIGHT = 1280;

const BIRD_SCALE = 0.75;
const OBSTACLE_SCALE = 0.75;
const BG_SCALE = 1;

const BIRD_COLLIDER_SCALE = 0.7;
const OBSTACLE_COLLIDER_SCALE = 1;

const GRAVITY = 0.5;
const FLAP = -8;
const OBSTACLE_INTERVAL = 1900;
const GAP_HEIGHT = 650;

let score = 0;
let scoreText;

const app = new PIXI.Application({
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: 0x1099bb,
});
document.body.appendChild(app.view);

// Tambahan Container
let gameContainer = new PIXI.Container();
let uiContainer = new PIXI.Container();
app.stage.addChild(gameContainer);
app.stage.addChild(uiContainer);

let bird, bg;
let velocity = 0;
let gameStarted = false;
let gameOver = false;
let obstacles = [];
let lastObstacleTime = 0;

const ratio = HEIGHT / WIDTH;
const vw = window.innerWidth;
const vh = window.innerHeight;
if (vh / vw > ratio) {
  app.view.style.width = '100vw';
  app.view.style.height = (vw * ratio) + 'px';
} else {
  app.view.style.height = '100vh';
  app.view.style.width = (vh / ratio) + 'px';
}

PIXI.Assets.load([
  'images/bird.png',
  'images/obs.png',
  'images/bg.png'
]).then(assets => {
  // Background
  bg = new PIXI.Sprite(assets['images/bg.png']);
  bg.anchor.set(0.5);
  bg.x = WIDTH / 2;
  bg.y = HEIGHT / 2;
  bg.scale.set(BG_SCALE);
  gameContainer.addChild(bg);

  // Bird
  bird = new PIXI.Sprite(assets['images/bird.png']);
  bird.anchor.set(0.5);
  bird.x = WIDTH / 3;
  bird.y = HEIGHT / 2;
  bird.scale.set(BIRD_SCALE);
  gameContainer.addChild(bird);

  // Teks Skor Aktif
  scoreText = new PIXI.Text('Score: 0', {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 'white',
    stroke: '#000000',
    strokeThickness: 6
  });
  scoreText.anchor.set(0, 0);
  scoreText.x = 30;
  scoreText.y = 30;
  uiContainer.addChild(scoreText);

  // Control
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerdown', () => {
    if (gameOver) return;
    gameStarted = true;
    velocity = FLAP;
  });

  app.ticker.add(gameLoop);
});

function spawnObstacle() {
  const pipeTexture = PIXI.Assets.get('images/obs.png');
  const GAP = GAP_HEIGHT;
  const minGapY = 200;
  const maxGapY = HEIGHT - 200 - GAP;
  const gapY = Math.floor(Math.random() * (maxGapY - minGapY)) + minGapY;

  // PIPE ATAS
  const top = new PIXI.Sprite(pipeTexture);
  top.anchor.set(0.5, 0);
  top.x = WIDTH + top.width;
  top.y = gapY - GAP;
  top.scale.set(OBSTACLE_SCALE);
  gameContainer.addChild(top);

  // PIPE BAWAH
  const bottom = new PIXI.Sprite(pipeTexture);
  bottom.anchor.set(0.5, 1);
  bottom.x = WIDTH + bottom.width;
  bottom.y = gapY + GAP;
  bottom.rotation = Math.PI;
  bottom.scale.set(OBSTACLE_SCALE);
  gameContainer.addChild(bottom);

  obstacles.push({ top, bottom, passed: false });
}

function gameLoop(delta) {
  if (!gameStarted || gameOver) return;

  velocity += GRAVITY;
  bird.y += velocity;

  const targetRotation = Math.min(Math.max(velocity / 10, -0.6), 1.2);
  bird.rotation = lerp(bird.rotation, targetRotation, 0.1);

  if (performance.now() - lastObstacleTime > OBSTACLE_INTERVAL) {
    spawnObstacle();
    lastObstacleTime = performance.now();
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    const { top, bottom } = obstacle;

    top.x -= 4;
    bottom.x -= 4;

    if (!obstacle.passed && top.x + top.width < bird.x) {
      obstacle.passed = true;
      score++;
      scoreText.text = `Score: ${score}`;
    }

    if (
      hitTest(bird, top, BIRD_COLLIDER_SCALE, OBSTACLE_COLLIDER_SCALE) ||
      hitTest(bird, bottom, BIRD_COLLIDER_SCALE, OBSTACLE_COLLIDER_SCALE) ||
      bird.y < 0 || bird.y > HEIGHT
    ) {
      endGame();
    }

    if (top.x < -top.width) {
      gameContainer.removeChild(top);
      gameContainer.removeChild(bottom);
      obstacles.splice(i, 1);
    }
  }
}

function hitTest(spriteA, spriteB, scaleA = 1, scaleB = 1) {
  const a = spriteA.getBounds();
  const b = spriteB.getBounds();

  const scaledA = {
    x: a.x + (a.width * (1 - scaleA)) / 2,
    y: a.y + (a.height * (1 - scaleA)) / 2,
    width: a.width * scaleA,
    height: a.height * scaleA,
  };

  const scaledB = {
    x: b.x + (b.width * (1 - scaleB)) / 2,
    y: b.y + (b.height * (1 - scaleB)) / 2,
    width: b.width * scaleB,
    height: b.height * scaleB,
  };

  return (
    scaledA.x + scaledA.width > scaledB.x &&
    scaledA.x < scaledB.x + scaledB.width &&
    scaledA.y + scaledA.height > scaledB.y &&
    scaledA.y < scaledB.y + scaledB.height
  );
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function endGame() {
  gameOver = true;

  const text = new PIXI.Text('Game Over', {
    fontFamily: 'Arial',
    fontSize: 64,
    fill: 'red',
    stroke: 'white',
    strokeThickness: 6
  });
  text.anchor.set(0.5);
  text.x = WIDTH / 2;
  text.y = HEIGHT / 2 - 100;
  uiContainer.addChild(text);

  const scoreResult = new PIXI.Text(`Score: ${score}`, {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 'white',
    stroke: '#000000',
    strokeThickness: 5
  });
  scoreResult.anchor.set(0.5);
  scoreResult.x = WIDTH / 2;
  scoreResult.y = HEIGHT / 2;
  uiContainer.addChild(scoreResult);
}
