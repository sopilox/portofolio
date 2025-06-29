const WIDTH = 720;
const HEIGHT = 1280;
const ITEMS = ['Reward 1', 'Reward 2', 'Reward 3', 'Reward 4', 'Reward 5']; // Ubah isi di sini

const app = new PIXI.Application({
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: 0x1f2f3f,
});
document.body.appendChild(app.view);

// Responsive scaling
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

let spinning = false;
let angle = 0;
let speed = 0;
let clicked = false;

// Container untuk spinner
const spinnerContainer = new PIXI.Container();
spinnerContainer.x = WIDTH / 2;
spinnerContainer.y = HEIGHT / 2;
app.stage.addChild(spinnerContainer);

// Gambar lingkaran spinner
const radius = 250;
const segmentAngle = (Math.PI * 2) / ITEMS.length;

// Buat sektor dan teks
for (let i = 0; i < ITEMS.length; i++) {
  const g = new PIXI.Graphics();
  g.beginFill(i % 2 === 0 ? 0xffcc00 : 0xff9900);
  g.moveTo(0, 0);
  g.arc(0, 0, radius, i * segmentAngle, (i + 1) * segmentAngle);
  g.lineTo(0, 0);
  g.endFill();
  spinnerContainer.addChild(g);

  const label = new PIXI.Text(ITEMS[i], {
    fontSize: 24,
    fill: 'black',
    align: 'center'
  });
  label.anchor.set(0.5);
  const angleMid = (i + 0.5) * segmentAngle;
  label.x = Math.cos(angleMid) * radius * 0.6;
  label.y = Math.sin(angleMid) * radius * 0.6;
  label.rotation = angleMid;
  spinnerContainer.addChild(label);
}

// Penunjuk
const pointer = new PIXI.Graphics();
pointer.beginFill(0xffffff);
pointer.lineStyle(4, 0xff0000);
pointer.moveTo(0, -20);
pointer.lineTo(0, -radius - 10);
pointer.lineTo(10, -radius);
pointer.lineTo(-10, -radius);
pointer.lineTo(0, -radius - 10);
pointer.endFill();
pointer.x = WIDTH / 2;
pointer.y = HEIGHT / 2;
app.stage.addChild(pointer);

// Mulai spin saat klik pertama
app.stage.eventMode = 'static';
app.stage.hitArea = app.screen;
app.stage.cursor = 'pointer';
app.stage.on('pointerdown', () => {
  if (!clicked) {
    clicked = true;
    speed = 0.5 + Math.random() * 1;
    spinning = true;
  }
});

// Ticker update rotasi
app.ticker.add(() => {
  if (spinning) {
    spinnerContainer.rotation += speed;
    speed *= 0.98; // deceleration
    if (speed < 0.002) {
      speed = 0;
      spinning = false;
      const selectedIndex = Math.floor(((Math.PI * 1.5 - spinnerContainer.rotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)) / segmentAngle);
      console.log('Result:', ITEMS[selectedIndex]);
      showResult(ITEMS[selectedIndex]);
    }
  }
});

// Menampilkan hasil
function showResult(text) {
  const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 'white',
    stroke: '#000000',
    strokeThickness: 6
  });

  const resultText = new PIXI.Text(`Result: ${text}`, style);
  resultText.anchor.set(0.5);
  resultText.x = WIDTH / 2;
  resultText.y = HEIGHT - 150;
  app.stage.addChild(resultText);
  createParticles(WIDTH / 2, HEIGHT / 2);

}

function createParticles(x, y) {
  for (let i = 0; i < 40; i++) {
    const star = new PIXI.Graphics();
    star.beginFill(0xffffff * Math.random());

    // Gambar bintang manual (5 titik)
    const points = 5;
    const outerRadius = 6 + Math.random() * 4;
    const innerRadius = outerRadius / 2;
    star.moveTo(0, -outerRadius);

    for (let j = 1; j < points * 2; j++) {
      const angle = (j * Math.PI) / points;
      const radius = j % 2 === 0 ? outerRadius : innerRadius;
      star.lineTo(Math.sin(angle) * radius, -Math.cos(angle) * radius);
    }

    star.closePath();
    star.endFill();

    star.x = x;
    star.y = y;

    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 3;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    app.stage.addChild(star);

    let life = 60 + Math.random() * 20;

    app.ticker.add(function particleTicker(delta) {
      if (life-- <= 0) {
        app.stage.removeChild(star);
        app.ticker.remove(particleTicker);
        return;
      }
      star.x += vx;
      star.y += vy;
      star.alpha -= 0.015;
      star.rotation += 0.2;
    });
  }
}
