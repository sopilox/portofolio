const WIDTH = 720;
const HEIGHT = 1280;
const GRID_SIZE = 3;
const TILE_SIZE = 600 / GRID_SIZE;
const IMAGE_PATH = 'js/images/animal1.png';

const app = new PIXI.Application({
  width: WIDTH,
  height: HEIGHT,
  backgroundColor:0x3d74eb,
});
document.body.appendChild(app.view);

let tiles = [];
let emptyPos = { x: GRID_SIZE - 1, y: GRID_SIZE - 1 };
let container;
let completed = false;
const animationSpeed = 0.15;
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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function isAdjacent(tile) {
  const dx = Math.abs(tile.gridX - emptyPos.x);
  const dy = Math.abs(tile.gridY - emptyPos.y);
  return (dx + dy === 1);
}

function swapTile(tile) {
  const targetX = emptyPos.x;
  const targetY = emptyPos.y;
  emptyPos.x = tile.gridX;
  emptyPos.y = tile.gridY;
  tile.gridX = targetX;
  tile.gridY = targetY;
  tile.moving = true;
}

function checkComplete() {
  for (const tile of tiles) {
    if (tile.originalX !== tile.gridX || tile.originalY !== tile.gridY) {
      return false;
    }
  }
  return true;
}

function showCompleteText() {
  const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 64,
    fill: 'white',
  });

  const text = new PIXI.Text('Puzzle Selesai!', style);
  text.anchor.set(0.5);
  text.x = WIDTH / 2;
  text.y = HEIGHT / 2;
  text.alpha = 0;
  app.stage.addChild(text);

  app.ticker.add(() => {
    if (text.alpha < 1) text.alpha += 0.02;
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

PIXI.Assets.load(IMAGE_PATH).then(baseTexture => {
  container = new PIXI.Container();
  app.stage.addChild(container);

  const imgWidth = baseTexture.width;
  const imgHeight = baseTexture.height;
  const maxSize = Math.min(WIDTH, HEIGHT) - 40;

  const scale = Math.min(maxSize / imgWidth, maxSize / imgHeight);
  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;

  const tileWidth = scaledWidth / GRID_SIZE;
  const tileHeight = scaledHeight / GRID_SIZE;

  container.x = (WIDTH - scaledWidth) / 2;
  container.y = (HEIGHT - scaledHeight) / 2;

  const positions = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (x === GRID_SIZE - 1 && y === GRID_SIZE - 1) continue;
      positions.push({ x, y });
    }
  }

  shuffle(positions);

  for (let i = 0; i < positions.length; i++) {
    const { x, y } = positions[i];
    const originalX = i % GRID_SIZE;
    const originalY = Math.floor(i / GRID_SIZE);

    const frame = new PIXI.Rectangle(
      originalX * (imgWidth / GRID_SIZE),
      originalY * (imgHeight / GRID_SIZE),
      imgWidth / GRID_SIZE,
      imgHeight / GRID_SIZE
    );

    const texture = new PIXI.Texture(baseTexture, frame);
    const tile = new PIXI.Sprite(texture);
    tile.width = tileWidth;
    tile.height = tileHeight;
    tile.eventMode = 'static';
    tile.cursor = 'pointer';

    tile.gridX = x;
    tile.gridY = y;
    tile.originalX = originalX;
    tile.originalY = originalY;
    tile.x = tile.gridX * tileWidth;
    tile.y = tile.gridY * tileHeight;
    tile.moving = false;

    tile.on('pointerdown', () => {
      if (completed || tile.moving) return;
      if (isAdjacent(tile)) {
        swapTile(tile);
        if (checkComplete()) {
          completed = true;
          showCompleteText();
        }
      }
    });

    container.addChild(tile);
    tiles.push(tile);
  }

  app.ticker.add(() => {
    for (const tile of tiles) {
      const targetX = tile.gridX * tileWidth;
      const targetY = tile.gridY * tileHeight;

      tile.x = lerp(tile.x, targetX, animationSpeed);
      tile.y = lerp(tile.y, targetY, animationSpeed);

      const dist = Math.hypot(tile.x - targetX, tile.y - targetY);
      if (dist < 0.5) {
        tile.x = targetX;
        tile.y = targetY;
        tile.moving = false;
      }
    }
  });
});
