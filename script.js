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
const galaxyCanvas = document.getElementById('galaxy');
const ctx = galaxyCanvas.getContext('2d');
const listeningContainer = document.getElementById('listening-container');

// Auto-resize textarea
inputText.addEventListener('input', () => {
  inputText.style.height = 'auto';
  inputText.style.height = `${inputText.scrollHeight}px`;
});

// Load history
window.onload = () => {
  const savedHistory = JSON.parse(localStorage.getItem('translationHistory')) || [];
  savedHistory.forEach(item => addHistoryItem(item.input, item.output, item.from, item.to));
  initGalaxy();
};

// Theme toggle
themeSwitch.addEventListener('change', () => {
  document.body.classList.toggle('light-mode', themeSwitch.checked);
  document.body.classList.toggle('dark-mode', !themeSwitch.checked);
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
      outputText.classList.add('typing');
      outputText.textContent = data.translated;
      setTimeout(() => outputText.classList.remove('typing'), 500);
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

// Voice input with listening animation
micBtn.addEventListener('click', () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = inputLang.value;
  listeningContainer.style.display = 'flex';
  
  recognition.start();
  recognition.onresult = (event) => {
    inputText.value = event.results[0][0].transcript;
    inputText.dispatchEvent(new Event('input')); // Trigger auto-resize
    listeningContainer.style.display = 'none';
  };
  recognition.onerror = () => listeningContainer.style.display = 'none';
  recognition.onend = () => listeningContainer.style.display = 'none';
});

// Copy output
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(outputText.textContent);
  copyBtn.innerHTML = '<svg class="btn-logo" viewBox="0 0 24 24" fill="#00cccc"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
  setTimeout(() => copyBtn.innerHTML = '<svg class="btn-logo" viewBox="0 0 24 24" fill="#00cccc"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>', 2000);
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

// Galaxy background with enhanced animation
function initGalaxy() {
  galaxyCanvas.width = window.innerWidth;
  galaxyCanvas.height = window.innerHeight;

  const stars = [];
  const symbols = ['Lingua', 'Traduci', '翻訳', 'अनुवाद', 'Übersetzen', 'Traduire', 'Traducir', '翻訳', '번역', 'Μετάφραση'];
  const textParticles = [];

  for (let i = 0; i < 300; i++) {
    stars.push({
      x: Math.random() * galaxyCanvas.width,
      y: Math.random() * galaxyCanvas.height,
      size: Math.random() * 2 + 1,
      speedX: Math.random() * 0.2 - 0.1,
      speedY: Math.random() * 0.2 - 0.1,
      opacity: Math.random() * 0.8 + 0.2
    });
  }

  for (let i = 0; i < 40; i++) {
    textParticles.push({
      x: Math.random() * galaxyCanvas.width,
      y: Math.random() * galaxyCanvas.height,
      text: symbols[Math.floor(Math.random() * symbols.length)],
      speedX: Math.random() * 0.3 - 0.15,
      speedY: Math.random() * 0.3 - 0.15,
      opacity: Math.random() * 0.5 + 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: Math.random() * 0.02 - 0.01
    });
  }

  function animateGalaxy() {
    ctx.clearRect(0, 0, galaxyCanvas.width, galaxyCanvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, galaxyCanvas.width, galaxyCanvas.height);

    // Draw stars with increased movement
    ctx.fillStyle = '#00cccc';
    stars.forEach(star => {
      ctx.globalAlpha = star.opacity;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      star.x += star.speedX;
      star.y += star.speedY;
      if (star.x < 0 || star.x > galaxyCanvas.width) star.speedX *= -1;
      if (star.y < 0 || star.y > galaxyCanvas.height) star.speedY *= -1;
    });

    // Draw text symbols with increased movement
    ctx.font = '20px Orbitron';
    ctx.fillStyle = '#ffd700';
    textParticles.forEach(p => {
      ctx.globalAlpha = p.opacity;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillText(p.text, 0, 0);
      ctx.restore();
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;
      if (p.x < 0 || p.x > galaxyCanvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > galaxyCanvas.height) p.speedY *= -1;
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(animateGalaxy);
  }

  animateGalaxy();
  window.addEventListener('resize', () => {
    galaxyCanvas.width = window.innerWidth;
    galaxyCanvas.height = window.innerHeight;
    initGalaxy();
  });
}