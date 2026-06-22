const STORAGE_KEY = 'vocab-practice-state';

const words = [
  { en: 'apple', zh: '蘋果' },
  { en: 'banana', zh: '香蕉' },
  { en: 'book', zh: '書本' },
  { en: 'computer', zh: '電腦' },
  { en: 'teacher', zh: '老師' },
  { en: 'student', zh: '學生' },
  { en: 'study', zh: '學習' },
  { en: 'music', zh: '音樂' },
  { en: 'movie', zh: '電影' },
  { en: 'travel', zh: '旅行' },
  { en: 'market', zh: '市場' },
  { en: 'family', zh: '家庭' },
  { en: 'friend', zh: '朋友' },
  { en: 'happy', zh: '快樂' },
  { en: 'beautiful', zh: '美麗' },
  { en: 'restaurant', zh: '餐廳' },
  { en: 'weather', zh: '天氣' },
  { en: 'city', zh: '城市' },
  { en: 'garden', zh: '花園' },
  { en: 'holiday', zh: '假期' },
];

const promptEl = document.getElementById('prompt');
const guessInput = document.getElementById('guessInput');
const resultEl = document.getElementById('result');
const statsEl = document.getElementById('stats');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const checkBtn = document.getElementById('checkBtn');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const reverseModeEl = document.getElementById('reverseMode');
const autoNextEl = document.getElementById('autoNext');
const resetBtn = document.getElementById('resetBtn');

const state = {
  index: 0,
  reverseMode: false,
  autoNext: false,
  correctCount: 0,
  wrongCount: 0,
  answered: {},
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    state.index = saved.index ?? state.index;
    state.reverseMode = saved.reverseMode ?? state.reverseMode;
    state.autoNext = saved.autoNext ?? state.autoNext;
    state.correctCount = saved.correctCount ?? state.correctCount;
    state.wrongCount = saved.wrongCount ?? state.wrongCount;
    state.answered = saved.answered ?? state.answered;
  } catch (err) {
    console.warn('無法讀取進度，已使用預設值。', err);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getCurrentWord() {
  return words[state.index % words.length];
}

function updatePrompt() {
  const current = getCurrentWord();
  promptEl.textContent = state.reverseMode ? current.en.trim() : current.zh;
  guessInput.value = '';
  guessInput.focus();
  const marker = state.answered[state.index] ? '✔︎ ' : '';
  promptEl.textContent = `${marker}${promptEl.textContent}`;
  updateStats();
}

function updateStats() {
  const current = getCurrentWord();
  const status = state.answered[state.index] ? '已答過' : '尚未作答';
  statsEl.innerHTML = `
    <div>題號：${state.index + 1} / ${words.length}</div>
    <div>目前題目：${status}</div>
    <div>答對次數：${state.correctCount}</div>
    <div>答錯次數：${state.wrongCount}</div>
    <div>提示方向：${state.reverseMode ? '英文→中文' : '中文→英文'}</div>
  `;
}

function showResult(text, type = '') {
  resultEl.textContent = text;
  resultEl.className = type ? `result ${type}` : 'result';
}

function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function checkAnswer() {
  const current = getCurrentWord();
  const answer = state.reverseMode ? current.zh : current.en;
  const guess = normalize(guessInput.value);
  if (!guess) {
    showResult('請先輸入答案。', 'error');
    return;
  }
  if (normalize(answer) === guess) {
    showResult('答對了！很好。', 'success');
    state.correctCount += 1;
    state.answered[state.index] = true;
    saveState();
    updateStats();
    if (state.autoNext) {
      setTimeout(() => nextWord(), 600);
    }
  } else {
    showResult(`答錯了，正確答案是：${answer}`, 'error');
    state.wrongCount += 1;
    saveState();
    updateStats();
  }
}

function nextWord() {
  state.index = (state.index + 1) % words.length;
  saveState();
  showResult('');
  updatePrompt();
}

function prevWord() {
  state.index = (state.index - 1 + words.length) % words.length;
  saveState();
  showResult('');
  updatePrompt();
}

function showAnswer() {
  const current = getCurrentWord();
  const answer = state.reverseMode ? current.zh : current.en;
  showResult(`答案：${answer}`, 'muted');
}

function resetProgress() {
  if (!confirm('你確定要重設進度嗎？')) {
    return;
  }
  state.index = 0;
  state.correctCount = 0;
  state.wrongCount = 0;
  state.answered = {};
  saveState();
  showResult('已重設進度。', 'success');
  updatePrompt();
}

function bindEvents() {
  prevBtn.addEventListener('click', prevWord);
  nextBtn.addEventListener('click', nextWord);
  checkBtn.addEventListener('click', checkAnswer);
  showAnswerBtn.addEventListener('click', showAnswer);
  resetBtn.addEventListener('click', resetProgress);
  reverseModeEl.addEventListener('change', () => {
    state.reverseMode = reverseModeEl.checked;
    saveState();
    updatePrompt();
  });
  autoNextEl.addEventListener('change', () => {
    state.autoNext = autoNextEl.checked;
    saveState();
  });
  guessInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      checkAnswer();
    }
  });
}

loadState();
reverseModeEl.checked = state.reverseMode;
autoNextEl.checked = state.autoNext;
bindEvents();
updatePrompt();
