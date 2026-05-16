const minRange = document.getElementById('minRange');
const maxRange = document.getElementById('maxRange');
const minValue = document.getElementById('minValue');
const maxValue = document.getElementById('maxValue');
const rangeText = document.getElementById('rangeText');

const numberBox = document.getElementById('numberBox');
const answerInput = document.getElementById('answerInput');
const toggleBtn = document.getElementById('toggleBtn');
const nextBtn = document.getElementById('nextBtn');
const statusText = document.getElementById('statusText');
const charButtons = document.querySelectorAll('.char-btn');

let numbersData = {};
let isRunning = false;
let currentNumber = null;
let answeredCorrectly = false;
let isLoaded = false;

async function loadNumbers() {
  try {
    const response = await fetch('german_numbers_1_1000.json');
    if (!response.ok) {
      throw new Error('Failed to load JSON');
    }

    numbersData = await response.json();
    isLoaded = true;
    statusText.textContent = 'Choose a range and press Start.';
  } catch (error) {
    statusText.textContent = 'Error loading JSON.';
    console.error(error);
  }
}

function normalizeText(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/ß/g, 'ss');
}

function syncRanges(changed) {
  let min = Number(minRange.value);
  let max = Number(maxRange.value);

  if (changed === 'min' && min > max) {
    max = min;
    maxRange.value = max;
  }

  if (changed === 'max' && max < min) {
    min = max;
    minRange.value = min;
  }

  minValue.textContent = min;
  maxValue.textContent = max;
  rangeText.textContent = `${min} - ${max}`;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showNewNumber() {
  const min = Number(minRange.value);
  const max = Number(maxRange.value);

  currentNumber = getRandomNumber(min, max);
  answeredCorrectly = false;

  numberBox.textContent = currentNumber;
  answerInput.value = '';
  answerInput.disabled = false;
  nextBtn.disabled = true;
  statusText.textContent = 'Type the number in German and press Enter.';
  answerInput.focus();
}

function startTrainer() {
  if (!isLoaded) {
    statusText.textContent = 'JSON has not loaded yet.';
    return;
  }

  isRunning = true;
  toggleBtn.textContent = 'Stop';

  minRange.disabled = true;
  maxRange.disabled = true;
  answerInput.disabled = false;

  showNewNumber();
}

function stopTrainer() {
  isRunning = false;
  currentNumber = null;
  answeredCorrectly = false;

  toggleBtn.textContent = 'Start';
  minRange.disabled = false;
  maxRange.disabled = false;
  answerInput.disabled = true;
  nextBtn.disabled = true;

  answerInput.value = '';
  numberBox.textContent = '—';
  statusText.textContent = 'Choose a range and press Start.';
}

function checkAnswer() {
  if (!isRunning || currentNumber === null || answeredCorrectly) return;

  const userAnswer = normalizeText(answerInput.value);
  const correctAnswer = normalizeText(numbersData[String(currentNumber)] || '');

  if (!userAnswer) {
    statusText.textContent = 'Enter your answer first.';
    return;
  }

  if (userAnswer === correctAnswer) {
    answeredCorrectly = true;
    nextBtn.disabled = false;
    statusText.textContent = 'Correct ✅ Press Next or Enter.';
  } else {
    statusText.textContent = 'Incorrect. Try again.';
  }
}

function insertCharacter(char) {
  if (answerInput.disabled) return;

  const start = answerInput.selectionStart;
  const end = answerInput.selectionEnd;
  const value = answerInput.value;

  answerInput.value = value.slice(0, start) + char + value.slice(end);
  answerInput.focus();

  const newCursorPos = start + char.length;
  answerInput.setSelectionRange(newCursorPos, newCursorPos);
}

minRange.addEventListener('input', () => syncRanges('min'));
maxRange.addEventListener('input', () => syncRanges('max'));

charButtons.forEach((button) => {
  button.addEventListener('click', () => {
    insertCharacter(button.dataset.char);
  });
});

toggleBtn.addEventListener('click', () => {
  if (isRunning) {
    stopTrainer();
  } else {
    startTrainer();
  }
});

nextBtn.addEventListener('click', () => {
  if (answeredCorrectly) {
    showNewNumber();
  }
});

answerInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();

    if (answeredCorrectly) {
      showNewNumber();
    } else {
      checkAnswer();
    }
  }
});

syncRanges();
loadNumbers();