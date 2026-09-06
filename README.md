# Number Guessing Game

A simple browser-based number guessing game built with HTML, CSS, and vanilla JavaScript. Pick a difficulty, guess the secret number before the timer runs out, and try to beat your high score.

## Description

The game picks a random number in a range that depends on the difficulty you choose. You get unlimited guesses, but a countdown timer, so the challenge comes from working efficiently rather than from running out of lives. After each guess you're told whether to go higher or lower, and your score depends on how hard the difficulty was, how many guesses you used, and how much time you had left.

## Features

- Three difficulty levels (Easy 1–50, Medium 1–100, Hard 1–500), each with its own timer
- Unlimited guesses with higher/lower feedback after every attempt
- Countdown timer that stops on a win or loss
- Scoring system based on difficulty, attempts, and time remaining
- High score saved in `localStorage` and kept after refreshing the page
- Win streak that resets after a loss
- Basic stats: games played, games won, win rate, high score, current streak
- Light/dark mode toggle that remembers your choice (and respects your system preference the first time)
- Responsive layout for mobile, tablet, and desktop
- Input validation for empty guesses, letters, decimals, negative numbers, out-of-range guesses, and repeated guesses

## Technologies Used

- HTML5
- CSS3 (custom properties for theming, flexbox/grid for layout, media queries for responsiveness)
- Vanilla JavaScript (no frameworks or libraries)

## How to Run

No build step or server needed — just open `index.html` in a browser.

```
number-guessing-game/
└── index.html   <- open this file
```

## How the Game Works

1. Enter your name and pick a difficulty, then click **Start Game**.
2. Guess a number in the shown range. After each guess you'll see "Try a higher number," "Try a lower number," or "Correct!"
3. Guess correctly before the timer hits 0 to win. If time runs out, you lose and the secret number is revealed.
4. Your score, high score, and streak update automatically, and you can click **Play Again** to try another round.

### Scoring formula

```javascript
score = (difficultyMultiplier * 100) + (timeLeft * 2) - (attempts * 5)
```

- `difficultyMultiplier` is 1 for Easy, 2 for Medium, 3 for Hard
- Score never goes below 0
- Score is only calculated on a win

## Project Structure

```
number-guessing-game/
│
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── README.md
```

## What I Learned

- Managing simple game state with plain variables instead of reaching for a framework
- Working with `setInterval`/`clearInterval` and making sure old timers are always cleared before starting a new one
- Structuring input validation as a single function that returns an error message (or `null`) instead of scattering checks around
- Using `localStorage` to persist data across page refreshes
- Using CSS custom properties to build a light/dark theme toggle without duplicating styles
- Writing basic accessible HTML (labels, fieldsets, focus states, `aria-live` for feedback messages)

## Future Improvements

- Add sound effects for correct/incorrect guesses
- Add a "reset all stats" button
- Show a short history of past guesses during the round
- Add an optional hint system (e.g. "warmer/colder" based on how close the guess was)
