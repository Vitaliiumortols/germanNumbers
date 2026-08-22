let initialData = [];
let prepositionsData = [];
let currentIndex = 0;
let isAnimating = false;
let attemptsLeft = 3;
let isWaitingForNext = false;

const card = document.getElementById("quizCard");
const cardCounter = document.getElementById("cardCounter");
const questionText = document.getElementById("questionText");
const cardImage = document.getElementById("cardImage");
const placeholder = document.getElementById("placeholder");
const sentenceDisplay = document.getElementById("sentenceDisplay");
const translationDisplay = document.getElementById("translationDisplay");
const answerInput = document.getElementById("answerInput");
const checkBtn = document.getElementById("checkBtn");
const feedbackText = document.getElementById("feedbackText");
const charBtns = document.querySelectorAll(".char-btn");

const resetBtn = document.getElementById("resetBtn");
const infoBtn = document.getElementById("infoBtn");
const closeInfoBtn = document.getElementById("closeInfoBtn");
const infoModal = document.getElementById("infoModal");
const modalCaseBadge = document.getElementById("modalCaseBadge");
const modalGenderBadge = document.getElementById("modalGenderBadge");

function extractGender(questionStr = "") {
  const match = questionStr.match(/\((.*?)\)/);
  if (!match) return "";
  const content = match[1].toLowerCase();
  if (content.startsWith("der ")) return "Maskulin (der)";
  if (content.startsWith("die ") && !content.includes("plural")) return "Feminin (die)";
  if (content.startsWith("das ")) return "Neutral (das)";
  if (content.includes("plural")) return "Plural (die)";
  return match[1];
}

function preloadImages(data) {
    data.forEach((item) => {
      if (item.image) {
        const img = new Image();
        img.src = item.image;
      }
    });
  }
  
  async function loadData() {
    try {
      const res = await fetch("prepositions_data.json");
      initialData = await res.json();
      preloadImages(initialData); // Браузер фоном кэширует все 29 картинок сразу
      resetProgress();
    } catch (err) {
      feedbackText.textContent = "Помилка завантаження JSON!";
      feedbackText.className = "feedback wrong";
    }
  }

function resetProgress() {
  currentIndex = 0;
  isAnimating = false;
  isWaitingForNext = false;
  
  prepositionsData = JSON.parse(JSON.stringify(initialData)).sort(() => Math.random() - 0.5);

  answerInput.style.display = "block";
  checkBtn.style.display = "block";
  document.querySelector(".char-buttons").style.display = "grid";
  
  renderCard();
}

function renderCard() {
  if (currentIndex >= prepositionsData.length) {
    sentenceDisplay.innerHTML = "🎉 Усі картки пройдено!";
    translationDisplay.textContent = "";
    answerInput.style.display = "none";
    checkBtn.style.display = "none";
    document.querySelector(".char-buttons").style.display = "none";
    return;
  }

  attemptsLeft = 3;
  isWaitingForNext = false;
  
  answerInput.readOnly = false;
  answerInput.value = "";

  const item = prepositionsData[currentIndex];

  modalCaseBadge.textContent = item.case || "—";
  const gender = extractGender(item.question);
  if (gender) {
    modalGenderBadge.textContent = gender;
    modalGenderBadge.style.display = "inline-block";
  } else {
    modalGenderBadge.style.display = "none";
  }

  cardCounter.textContent = `${currentIndex + 1} / ${prepositionsData.length}`;
  questionText.textContent = item.question || "";

  const cleanSentence = item.sentenceTemplate.replace("___", '<span class="gap-slot"></span>');
  sentenceDisplay.innerHTML = cleanSentence;
  translationDisplay.textContent = item.translation || "";

  if (item.image && item.image.trim() !== "") {
    cardImage.src = item.image;
    cardImage.style.display = "block";
    placeholder.style.display = "none";
  
    cardImage.onerror = () => {
      cardImage.style.display = "none";
      placeholder.style.display = "block";
      placeholder.textContent = "🖼️ Зображення не знайдено";
    };
  } else {
    cardImage.style.display = "none";
    placeholder.style.display = "block";
    placeholder.textContent = "🖼️ Зображення";
  }

  feedbackText.textContent = "";
  feedbackText.className = "feedback";
  answerInput.focus();
}

function triggerShake() {
  card.classList.remove("shake");
  void card.offsetWidth;
  card.classList.add("shake");
  setTimeout(() => card.classList.remove("shake"), 400);
}

function triggerSwipe(direction, callback) {
  isAnimating = true;
  card.classList.remove("swipe-right", "swipe-left", "reset-position", "shake");

  if (direction === "right") {
    card.classList.add("swipe-right");
  } else {
    card.classList.add("swipe-left");
  }

  setTimeout(() => {
    callback();
    card.classList.remove("swipe-right", "swipe-left");
    card.classList.add("reset-position");

    setTimeout(() => {
      card.classList.remove("reset-position");
      isAnimating = false;
    }, 50);
  }, 420);
}

function handleAction() {
  if (isAnimating || currentIndex >= prepositionsData.length) return;

  if (isWaitingForNext) {
    isWaitingForNext = false;
    triggerSwipe("left", () => {
      const failedItem = prepositionsData.splice(currentIndex, 1)[0];
      prepositionsData.push(failedItem);
      renderCard();
    });
    return;
  }

  const userVal = answerInput.value.trim().toLowerCase();
  if (!userVal) return;

  const item = prepositionsData[currentIndex];
  const isCorrect = item.acceptedAnswers.some(ans => ans.toLowerCase() === userVal);

  if (isCorrect) {
    feedbackText.textContent = `Richtig! ✓ (${item.fullSentence})`;
    feedbackText.className = "feedback correct";

    sentenceDisplay.innerHTML = item.sentenceTemplate.replace(
      "___",
      `<span class="gap-slot" style="background: rgba(39, 132, 71, 0.15); border-bottom-color: #278447; color: #278447;">${item.correctPreposition}</span>`
    );

    triggerSwipe("right", () => {
      currentIndex++;
      renderCard();
    });
  } else {
    attemptsLeft--;

    if (attemptsLeft > 0) {
      triggerShake();
      const attemptWord = attemptsLeft === 1 ? "спроба" : "спроби";
      feedbackText.textContent = `Неправильно! Залишилося ${attemptsLeft} ${attemptWord}.`;
      feedbackText.className = "feedback wrong";
      answerInput.value = "";
      answerInput.focus();
    } else {
      triggerShake();

      sentenceDisplay.innerHTML = item.sentenceTemplate.replace(
        "___",
        `<span class="gap-slot" style="background: rgba(194, 59, 50, 0.15); border-bottom-color: #c23b32; color: #c23b32;">${item.correctPreposition}</span>`
      );

      feedbackText.innerHTML = `Правильно: <b>${item.correctPreposition}</b> — ${item.fullSentence} <br><span style="font-size: 14px; opacity: 0.8;">(Натисни Enter для продовження)</span>`;
      feedbackText.className = "feedback wrong";

      answerInput.readOnly = true;

      setTimeout(() => {
        isWaitingForNext = true;
      }, 50);
    }
  }
}

resetBtn.addEventListener("click", () => {
  if (confirm("Скинути поточний прогрес і почати спочатку?")) {
    resetProgress();
  }
});

infoBtn.addEventListener("click", () => infoModal.classList.add("open"));
closeInfoBtn.addEventListener("click", () => infoModal.classList.remove("open"));
window.addEventListener("click", (e) => {
  if (e.target === infoModal) infoModal.classList.remove("open");
});

charBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!answerInput.readOnly) {
      answerInput.value += btn.dataset.char;
      answerInput.focus();
    }
  });
});

checkBtn.addEventListener("click", handleAction);

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleAction();
  }
});

loadData();