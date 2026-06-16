// ── Emojis disponíveis
const ALL_EMOJIS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼',
                    '🐨','🐯','🦁','🐸','🐙','🦋','🌺','🍕',
                    '🎸','🚀','⚡','🎯','💎','🍦','🎃','🌈'];

// ── Estado do jogo
let cards = [];
let flipped = [];
let matched = 0;
let moves = 0;
let totalPairs = 8;
let locked = false;
let timerInterval = null;
let seconds = 0;
let cols = 4;

// ── Elementos do DOM
const board        = document.getElementById('board');
const movesEl      = document.getElementById('moves');
const pairsEl      = document.getElementById('pairs');
const timerEl      = document.getElementById('timer');
const winOverlay   = document.getElementById('win-overlay');
const winMsg       = document.getElementById('win-msg');
const btnRestart   = document.getElementById('btn-restart');
const btnPlayAgain = document.getElementById('btn-play-again');
const diffBtns     = document.querySelectorAll('.diff-btn');

// ── Seleção de dificuldade
diffBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    diffBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const [c, r] = btn.dataset.grid.split('x').map(Number);
    cols = c;
    totalPairs = (c * r) / 2;
    initGame();
  });
});

// ── Embaralha array (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Inicia o jogo
function initGame() {
  clearInterval(timerInterval);
  seconds = 0;
  moves = 0;
  matched = 0;
  flipped = [];
  locked = false;

  timerEl.textContent = '0s';
  movesEl.textContent = '0';
  pairsEl.textContent = `0 / ${totalPairs}`;
  winOverlay.classList.remove('show');

  // Seleciona emojis e duplica
  const chosen = shuffle(ALL_EMOJIS).slice(0, totalPairs);
  cards = shuffle([...chosen, ...chosen]);

  // Renderiza o tabuleiro
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  board.innerHTML = '';
  cards.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.emoji = emoji;
    card.dataset.index = i;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back"></div>
        <div class="card-face card-front">${emoji}</div>
      </div>`;
    card.addEventListener('click', onCardClick);
    board.appendChild(card);
  });

  // Inicia o timer
  timerInterval = setInterval(() => {
    seconds++;
    timerEl.textContent = seconds + 's';
  }, 1000);
}

// ── Clique na carta
function onCardClick(e) {
  const card = e.currentTarget;
  if (locked) return;
  if (card.classList.contains('flipped')) return;
  if (card.classList.contains('matched')) return;

  card.classList.add('flipped');
  flipped.push(card);

  if (flipped.length === 2) {
    locked = true;
    moves++;
    movesEl.textContent = moves;
    checkMatch();
  }
}

// ── Verifica par
function checkMatch() {
  const [a, b] = flipped;
  if (a.dataset.emoji === b.dataset.emoji) {
    // Par encontrado!
    setTimeout(() => {
      a.classList.add('matched');
      b.classList.add('matched');
      flipped = [];
      locked = false;
      matched++;
      pairsEl.textContent = `${matched} / ${totalPairs}`;
      if (matched === totalPairs) showWin();
    }, 300);
  } else {
    // Não é par: desvira após um tempo
    setTimeout(() => {
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      flipped = [];
      locked = false;
    }, 900);
  }
}

// ── Tela de vitória
function showWin() {
  clearInterval(timerInterval);
  winMsg.textContent = `${moves} tentativas em ${seconds} segundos. Incrível!`;
  winOverlay.classList.add('show');
}

// ── Eventos dos botões
btnRestart.addEventListener('click', initGame);
btnPlayAgain.addEventListener('click', initGame);

// ── Inicia o jogo ao carregar a página
initGame();