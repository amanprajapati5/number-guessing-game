// SETTINGS 

const DIFFICULTY_SETTINGS = {
  easy: { min: 1, max: 50, time: 60, multiplier: 1 },
  medium: { min: 1, max: 100, time: 45, multiplier: 2 },
  hard: { min: 1, max: 500, time: 30, multiplier: 3 }
};

const STATS_KEY = "numberGameStats";
const THEME_KEY = "numberGameTheme";

// DOM ELEMENTS 

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");

const startForm = document.getElementById("start-form");
const nameInput = document.getElementById("player-name");
const nameErrorEl = document.getElementById("name-error");

const guessForm = document.getElementById("guess-form");
const guessInput = document.getElementById("guess-input");


const greetingEl = document.getElementById("greeting");
const rangeDisplayEl = document.getElementById("range-display");
const timerDisplayEl = document.getElementById("timer-display");
const attemptsDisplayEl = document.getElementById("attempts-display");
const streakDisplayEl = document.getElementById("streak-display");
const feedbackMessageEl = document.getElementById("feedback-message");
const guessHistoryListEl = document.getElementById("guess-history-list");

const endTitleEl = document.getElementById("end-title");
const endMessageEl = document.getElementById("end-message");
const endScoreEl = document.getElementById("end-score");
const endHighScoreEl = document.getElementById("end-high-score");
const endStreakEl = document.getElementById("end-streak");
const playAgainBtn = document.getElementById("play-again-btn");

const themeToggleBtn = document.getElementById("theme-toggle");
const resetStatsButton = document.getElementById("reset-stats-btn");

const statHighScoreEl = document.getElementById("stat-high-score");
const statGamesPlayedEl = document.getElementById("stat-games-played");
const statWinRateEl = document.getElementById("stat-win-rate");
const statStreakEl = document.getElementById("stat-streak");

//  GAME STATE
// These variables track everything about the game currently being played.
//  They get reset every time a new game starts.


let secretNumber;
let minNumber;
let maxNumber;
let difficulty;
let attempts = 0;
let previousGuesses = [];
let timeLeft = 0;
let timerId = null;
let gameActive = false;
let currentStreak = 0;


// SCREEN SWITCHING


function showScreen(screenToShow) {
  [startScreen, gameScreen, endScreen].forEach((screen) => {
    screen.classList.add("hidden");
  });
  screenToShow.classList.remove("hidden");
}


// STARTING A GAME


function getNameValidationError(name) {
  const trimmed = name.trim();

  if (trimmed === "") {
    return "Please enter your name.";
  }
  if (trimmed.length < 2) {
    return "Name should be at least 2 characters.";
  }
  if (!/^[a-zA-Z' -]+$/.test(trimmed)) {
    return "Name should only contain letters.";
  }
  return null;
}

function generateSecretNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startGame(event) {
  event.preventDefault();

  const nameError = getNameValidationError(nameInput.value);
  if (nameError) {
    nameErrorEl.textContent = nameError;
    return;
  }
  nameErrorEl.textContent = "";

  const playerName = nameInput.value.trim();
  difficulty = document.querySelector('input[name="difficulty"]:checked').value;

  const settings = DIFFICULTY_SETTINGS[difficulty];
  minNumber = settings.min;
  maxNumber = settings.max;
  secretNumber = generateSecretNumber(minNumber, maxNumber);

  // Reset everything from any previous round
// Reset everything from any previous round
attempts = 0;
previousGuesses = [];
gameActive = true;

updateGuessHistory();

  greetingEl.textContent = `Good luck, ${playerName}!`;
  rangeDisplayEl.textContent = `Guess a number between ${minNumber} and ${maxNumber}.`;
  attemptsDisplayEl.textContent = "0";
  streakDisplayEl.textContent = currentStreak;
  guessInput.value = "";
  feedbackMessageEl.textContent = "";
  feedbackMessageEl.className = "feedback-message";

  startTimer(settings.time);
  showScreen(gameScreen);
  guessInput.focus();
}


// TIMER

function startTimer(seconds) {
  stopTimer(); // just in case one is already running, so we never get two ticking at once

  timeLeft = seconds;
  updateTimerDisplay();

  timerId = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function updateTimerDisplay() {
  timerDisplayEl.textContent = timeLeft;
  timerDisplayEl.classList.toggle("timer-warning", timeLeft <= 10 && timeLeft > 0);
}

function updateGuessHistory() {
  guessHistoryListEl.innerHTML = "";

  previousGuesses.forEach((guess) => {
    const listItem = document.createElement("li");
    listItem.textContent = guess;
    guessHistoryListEl.appendChild(listItem);
  });
}


// HANDLING A GUESS


function getGuessValidationError(rawValue) {
  if (rawValue.trim() === "") {
    return "Please enter a number.";
  }

  const guess = Number(rawValue);

  if (!Number.isFinite(guess)) {
    return "That's not a valid number.";
  }
  if (!Number.isInteger(guess)) {
    return "Please enter a whole number, no decimals.";
  }
  if (guess < minNumber || guess > maxNumber) {
    return `Enter a number between ${minNumber} and ${maxNumber}.`;
  }
  if (previousGuesses.includes(guess)) {
    return "You already tried that number.";
  }
  return null;
}

function showFeedback(message, type) {
  feedbackMessageEl.textContent = message;
  feedbackMessageEl.className = `feedback-message feedback-${type}`;
}

function updateGuessHistory() {
  guessHistoryListEl.innerHTML = "";

  previousGuesses.forEach((guess) => {
    const listItem = document.createElement("li");
    listItem.textContent = guess;
    guessHistoryListEl.appendChild(listItem);
  });
}

function handleGuess(event) {
  event.preventDefault();

  if (!gameActive) {
    return;
  }

  const rawValue = guessInput.value;
  const errorMessage = getGuessValidationError(rawValue);

  if (errorMessage) {
    // Invalid guesses don't count as an attempt and don't touch the score
    showFeedback(errorMessage, "error");
    return;
  }

  const guess = Number(rawValue);
  previousGuesses.push(guess);
  updateGuessHistory();
  attempts++;
  attemptsDisplayEl.textContent = attempts;

  if (guess === secretNumber) {
    showFeedback("Correct!", "correct");
    endGame(true);
  } else if (guess < secretNumber) {
    showFeedback("Try a higher number.", "hint");
  } else {
    showFeedback("Try a lower number.", "hint");
  }

  guessInput.value = "";
  guessInput.focus();
}


// SCORE


function calculateScore(timeRemaining, attemptCount, multiplier) {
  // Harder difficulty raises the base score, leftover time adds a bonus,
  // and every attempt costs a small penalty. Never goes below 0.
  const rawScore = (multiplier * 100) + (timeRemaining * 2) - (attemptCount * 5);
  return Math.max(0, rawScore);
}


// ENDING A GAME


function endGame(didWin) {
  gameActive = false;
  stopTimer();

  const stats = loadStats();
  stats.gamesPlayed++;

  let earnedScore = 0;

  if (didWin) {
    earnedScore = calculateScore(timeLeft, attempts, DIFFICULTY_SETTINGS[difficulty].multiplier);
    stats.gamesWon++;
    currentStreak++;

    endTitleEl.textContent = "You got it!";
    endMessageEl.textContent =
      `The number was ${secretNumber}. You found it in ${attempts} ${attempts === 1 ? "guess" : "guesses"}.`;
  } else {
    currentStreak = 0;

    endTitleEl.textContent = "Time's up!";
    endMessageEl.textContent = `The number was ${secretNumber}. Better luck next time.`;
  }

  stats.currentStreak = currentStreak;

  if (earnedScore > stats.highScore) {
    stats.highScore = earnedScore;
  }

  saveStats(stats);
  updateStatsDisplay(stats);

  endScoreEl.textContent = earnedScore;
  endHighScoreEl.textContent = stats.highScore;
  endStreakEl.textContent = currentStreak;

  showScreen(endScreen);
}


// STATISTICS & HIGH SCORE (localStorage)


function loadStats() {
  const saved = localStorage.getItem(STATS_KEY);

  if (!saved) {
    return { highScore: 0, gamesPlayed: 0, gamesWon: 0, currentStreak: 0 };
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    // Saved data got corrupted somehow - just start fresh instead of crashing
    return { highScore: 0, gamesPlayed: 0, gamesWon: 0, currentStreak: 0 };
  }
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function updateStatsDisplay(stats) {
  const winRate = stats.gamesPlayed === 0
    ? 0
    : Math.round((stats.gamesWon / stats.gamesPlayed) * 100);

  statHighScoreEl.textContent = stats.highScore;
  statGamesPlayedEl.textContent = stats.gamesPlayed;
  statWinRateEl.textContent = `${winRate}%`;
  statStreakEl.textContent = stats.currentStreak;
}


// THEME (light / dark mode)


function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  themeToggleBtn.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
}

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    return savedTheme;
  }
  // No saved preference yet - fall back to whatever the OS/browser prefers
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
}

function resetStats() {
  const confirmed = confirm(
    "Are you sure you want to reset all statistics?"
  );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(STATS_KEY);

  const stats = loadStats();

  currentStreak = 0;
  updateStatsDisplay(stats);
}
// INIT

startForm.addEventListener("submit", startGame);
guessForm.addEventListener("submit", handleGuess);
playAgainBtn.addEventListener("click", () => showScreen(startScreen));
themeToggleBtn.addEventListener("click", toggleTheme);
resetStatsButton.addEventListener("click", resetStats);

applyTheme(getInitialTheme());

const initialStats = loadStats();
currentStreak = initialStats.currentStreak;
updateStatsDisplay(initialStats);
