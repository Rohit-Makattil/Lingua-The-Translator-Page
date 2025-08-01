const translateBtn = document.getElementById('translate-btn');
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const inputLang = document.getElementById('input-lang');
const outputLang = document.getElementById('output-lang');
const playBtn = document.getElementById('play-btn');
const micBtn = document.getElementById('mic-btn');
const copyBtn = document.getElementById('copy-btn');
const swapBtn = document.getElementById('swap-btn');
const themeSwitch = document.getElementById('theme-switch');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const loader = document.getElementById('loader');

// Auto-resize textarea
inputText.addEventListener('input', () => {
  inputText.style.height = 'auto';
  inputText.style.height = `${inputText.scrollHeight}px`;
});

// Load history
window.onload = () => {
  const savedHistory = JSON.parse(localStorage.getItem('translationHistory')) || [];
  savedHistory.forEach(item => addHistoryItem(item.input, item.output, item.from, item.to));
};

// Theme toggle
themeSwitch.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode', themeSwitch.checked);
});

// Translate text
translateBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  const from = inputLang.value;
  const to = outputLang.value;

  if (!text) {
    outputText.textContent = '⚠️ Please enter some text first.';
    return;
  }

  loader.style.display = 'flex';
  outputText.textContent = '';

  try {
    const response = await fetch('/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, from, to })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    setTimeout(() => {
      loader.style.display = 'none';
      outputText.textContent = data.translated;
      addHistoryItem(text, data.translated, from, to);
      saveHistory(text, data.translated, from, to);
    }, 400);
  } catch (error) {
    loader.style.display = 'none';
    console.error(error);
    outputText.textContent = '❌ Translation failed. Please try again.';
  }
});

// Play audio
playBtn.addEventListener('click', () => {
  const utterance = new SpeechSynthesisUtterance(outputText.textContent);
  utterance.lang = outputLang.value;
  speechSynthesis.speak(utterance);
});

// Voice input
micBtn.addEventListener('click', () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = inputLang.value;
  recognition.start();
  recognition.onresult = (event) => {
    inputText.value = event.results[0][0].transcript;
    inputText.dispatchEvent(new Event('input')); // Trigger auto-resize
  };
});

// Copy output
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(outputText.textContent);
  copyBtn.innerHTML = '<i class="fas fa-check"></i>';
  setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i>', 2000);
});

// Swap languages
swapBtn.addEventListener('click', () => {
  const temp = inputLang.value;
  inputLang.value = outputLang.value;
  outputLang.value = temp;
});

// Clear history
clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem('translationHistory');
  historyList.innerHTML = '';
});

// History item management
function addHistoryItem(input, output, from, to) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span>${input} (${from}) ➡️ ${output} (${to})</span>
    <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
  `;
  li.querySelector('.delete-btn').addEventListener('click', () => {
    li.remove();
    updateHistoryStorage(input, output, from, to);
  });
  historyList.prepend(li);
}

function saveHistory(input, output, from, to) {
  let history = JSON.parse(localStorage.getItem('translationHistory')) || [];
  history.push({ input, output, from, to });
  localStorage.setItem('translationHistory', JSON.stringify(history));
}

function updateHistoryStorage(input, output, from, to) {
  let history = JSON.parse(localStorage.getItem('translationHistory')) || [];
  history = history.filter(item => !(item.input === input && item.output === output && item.from === from && item.to === to));
  localStorage.setItem('translationHistory', JSON.stringify(history));
}

// Particles background
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 50;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }
  draw() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

animateParticles();
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});