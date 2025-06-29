// Tebak Kata dari Emoji Playable Ad
const quizzes = [
  { emojis: ["🍕", "🏀"], options: ["Pizza Basket", "NBA Slice", "Pizza Ball"], correct: 2 },
  { emojis: ["🐱", "👑"], options: ["Royal Cat", "Cat King", "Pussy Crown"], correct: 1 },
  { emojis: ["🚀", "🌕"], options: ["Rocket Moon", "Fly to Space", "Moon Launch"], correct: 0 }
];

const WIDTH = 720;
const HEIGHT = 1280;
const BG_COLORS = [0xffe066, 0x6ec6ff, 0xff8a65];

const app = new PIXI.Application({
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: BG_COLORS[0],
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});
document.body.appendChild(app.view);

// Responsive canvas
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

app.view.style.display = 'block';
app.view.style.margin = '0 auto';

let currentQuiz = 0;
let score = 0;

const container = new PIXI.Container();
app.stage.addChild(container);

// Emoji text
const emojiText = new PIXI.Text('', {
    fontFamily: 'Arial',
    fontSize: 120,
    align: 'center',
    fill: '#222',
    fontWeight: 'bold',
});
emojiText.anchor.set(0.5);
emojiText.x = WIDTH / 2;
emojiText.y = 260;
container.addChild(emojiText);

// Option buttons
const buttonStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 54,
    fill: '#fff',
    fontWeight: 'bold',
});
const buttonBgColors = [0x42a5f5, 0x66bb6a, 0xff7043];
const optionButtons = [];
for (let i = 0; i < 3; i++) {
    const btn = new PIXI.Container();
    const bg = new PIXI.Graphics();
    bg.beginFill(buttonBgColors[i]);
    bg.drawRoundedRect(-260, -60, 520, 120, 40);
    bg.endFill();
    btn.addChild(bg);
    const label = new PIXI.Text('', buttonStyle);
    label.anchor.set(0.5);
    btn.addChild(label);
    btn.x = WIDTH / 2;
    btn.y = 520 + i * 180;
    btn.interactive = true;
    btn.buttonMode = true;
    btn.alpha = 0;
    btn.on('pointertap', () => handleAnswer(i));
    container.addChild(btn);
    optionButtons.push({ btn, label, bg });
}

// Result text
const resultText = new PIXI.Text('', {
    fontFamily: 'Arial',
    fontSize: 80,
    fill: '#fff',
    fontWeight: 'bold',
    align: 'center',
    dropShadow: true,
    dropShadowColor: '#222',
    dropShadowBlur: 8,
});
resultText.anchor.set(0.5);
resultText.x = WIDTH / 2;
resultText.y = 1050;
resultText.alpha = 0;
container.addChild(resultText);

function showQuiz(idx) {
    // Ganti background
    app.renderer.backgroundColor = BG_COLORS[idx % BG_COLORS.length];
    // Set emoji
    emojiText.text = quizzes[idx].emojis.join('  +  ');
    // Set options
    quizzes[idx].options.forEach((opt, i) => {
        optionButtons[i].label.text = opt;
        optionButtons[i].btn.alpha = 0;
        optionButtons[i].btn.interactive = true;
        fadeIn(optionButtons[i].btn, 0.2 + i * 0.1);
    });
    resultText.alpha = 0;
}

function handleAnswer(selected) {
    // Disable all buttons
    optionButtons.forEach(b => b.btn.interactive = false);
    const correct = quizzes[currentQuiz].correct;
    if (selected === correct) {
        score++;
        showResult('Right!', 0x66bb6a);
    } else {
        showResult('Wrong!', 0xff7043);
    }
    setTimeout(() => {
        currentQuiz++;
        if (currentQuiz < quizzes.length) {
            showQuiz(currentQuiz);
        } else {
            showFinalScore();
        }
    }, 2000);
}

function showResult(text, color) {
    resultText.text = text;
    resultText.style.fill = PIXI.utils.hex2string(color);
    resultText.alpha = 0;
    fadeIn(resultText, 0);
}

function showFinalScore() {
    emojiText.text = '🎉';
    optionButtons.forEach(b => b.btn.visible = false);
    resultText.text = `Your Score: ${score}/${quizzes.length}`;
    resultText.style.fill = '#fff';
    resultText.alpha = 0;
    fadeIn(resultText, 0);
}

function fadeIn(displayObj, delay = 0) {
    displayObj.alpha = 0;
    let t = 0;
    app.ticker.add(function fade(delta) {
        if (t < delay * 60) { t += delta; return; }
        displayObj.alpha += 0.08 * delta;
        if (displayObj.alpha >= 1) {
            displayObj.alpha = 1;
            app.ticker.remove(fade);
        }
    });
}

// Mulai game
document.body.style.background = '#000';
showQuiz(currentQuiz);
