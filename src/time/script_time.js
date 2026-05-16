const clockDisplay = document.getElementById("clockDisplay");
const answerInput = document.getElementById("answerInput");
const checkBtn = document.getElementById("checkBtn");
const newTimeBtn = document.getElementById("newTimeBtn");
const resultText = document.getElementById("resultText");
const hintText = document.getElementById("hintText");

let currentHour = 14;
let currentMinute = 55;

const baseNumbers = {
  0: "null",
  1: "eins",
  2: "zwei",
  3: "drei",
  4: "vier",
  5: "fünf",
  6: "sechs",
  7: "sieben",
  8: "acht",
  9: "neun",
  10: "zehn",
  11: "elf",
  12: "zwölf",
  13: "dreizehn",
  14: "vierzehn",
  15: "fünfzehn",
  16: "sechzehn",
  17: "siebzehn",
  18: "achtzehn",
  19: "neunzehn",
  20: "zwanzig",
  30: "dreißig",
  40: "vierzig",
  50: "fünfzig"
};

function numberWord(n) {
  if (baseNumbers[n]) return baseNumbers[n];

  const ones = n % 10;
  const tens = Math.floor(n / 10) * 10;
  const oneWord = ones === 1 ? "ein" : baseNumbers[ones];

  return `${oneWord}und${baseNumbers[tens]}`;
}

function normalize(text) {
  return text
    .toLowerCase()
    .trim()
    .replaceAll("ß", "ss")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ä", "a")
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ");
}

function hour12(hour) {
  const h = hour % 12;
  return h === 0 ? 12 : h;
}

function hourName(hour) {
  return numberWord(hour12(hour));
}

function nextHourName(hour) {
  return numberWord(hour12(hour + 1));
}

function timeToString(hour, minute) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function addWithEsIst(answers) {
  const full = [];

  answers.forEach(answer => {
    full.push(answer);
    full.push(`Es ist ${answer}`);
  });

  return full;
}

function generateAnswers(hour, minute) {
  const answers = [];

  const current = hourName(hour);
  const next = nextHourName(hour);

  if (minute === 0) {
    answers.push(`${numberWord(hour)} Uhr`);
  } else {
    answers.push(`${numberWord(hour)} Uhr ${numberWord(minute)}`);
  }

  if (minute === 0) {
    answers.push(`${current} Uhr`);
  } else if (minute === 15) {
    answers.push(`Viertel nach ${current}`);
  } else if (minute === 30) {
    answers.push(`halb ${next}`);
  } else if (minute === 45) {
    answers.push(`Viertel vor ${next}`);
  } else if (minute < 30) {
    answers.push(`${numberWord(minute)} nach ${current}`);
  } else {
    answers.push(`${numberWord(60 - minute)} vor ${next}`);
  }

  if (minute === 25) answers.push(`fünf vor halb ${next}`);
  if (minute === 35) answers.push(`fünf nach halb ${next}`);

  if (minute >= 1 && minute <= 5) answers.push(`kurz nach ${current}`);
  if (minute >= 55 && minute <= 59) {
    answers.push(`kurz vor ${next}`);
    answers.push(`gleich ${next}`);
  }

  return addWithEsIst(answers);
}

function checkAnswer() {
  const userAnswer = answerInput.value;
  const correctAnswers = generateAnswers(currentHour, currentMinute);

  const normalizedUser = normalize(userAnswer);
  const normalizedCorrect = correctAnswers.map(normalize);

  resultText.className = "result";

  if (normalizedCorrect.includes(normalizedUser)) {
    resultText.textContent = "Correct!";
    resultText.classList.add("correct");
    hintText.textContent = "";
  } else {
    resultText.textContent = "Try again.";
    resultText.classList.add("wrong");
    hintText.textContent = `Correct: ${correctAnswers[0]}`;
  }
}

function createNewTime() {
    currentHour = Math.floor(Math.random() * 24);
    currentMinute = Math.floor(Math.random() * 60);
  
    clockDisplay.textContent = timeToString(currentHour, currentMinute);
    answerInput.value = "";
    resultText.textContent = "";
    hintText.textContent = "";
    answerInput.focus();
  }

checkBtn.addEventListener("click", checkAnswer);
newTimeBtn.addEventListener("click", createNewTime);

answerInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    checkAnswer();
  }
});

const infoBtn = document.getElementById("infoBtn");
const infoModal = document.getElementById("infoModal");
const closeInfoBtn = document.getElementById("closeInfoBtn");

infoBtn.addEventListener("click", () => {
  infoModal.classList.add("open");
});

closeInfoBtn.addEventListener("click", () => {
  infoModal.classList.remove("open");
});

infoModal.addEventListener("click", event => {
  if (event.target === infoModal) {
    infoModal.classList.remove("open");
  }
});

createNewTime();