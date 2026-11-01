# Times Table Grid

A simple, customisable multiplication grid for teachers. Pick which times tables to practise, scramble the rows and columns, run a countdown timer, then reveal the answers on the board — or print it as a worksheet.

**Try it:** https://toddfisher42.github.io/Multiplication-grid/

## Features

- **Choose the tables** — tick any numbers from 1 to 15, or use the *1–10*, *1–12* and *Select All* shortcuts.
- **Scramble** — shuffles the row and column headers independently, so students can't just count up.
- **Countdown timer** — 2 to 10 minutes, or a custom time (1–60 minutes). Pause, resume, and reset as needed.
- **Time's up alert** — a beep plus a flashing on-screen message, and the answers are revealed automatically.
- **Show / hide answers** at any time.
- **Print-friendly** — printing (Ctrl/Cmd + P) hides the controls and prints just the grid, black on white. Print once with answers hidden for the worksheet and once with answers showing for the answer key.
- **Light and dark themes** — defaults to your device's setting.
- **Remembers your settings** — the selected numbers, timer length, and theme are saved in your browser.
- **Works on any screen** — the grid scales from phones up to classroom projectors.

## Running it locally

There's nothing to install or build. Download or clone the repository and open `index.html` in any modern browser.

```bash
git clone https://github.com/ToddFisher42/Multiplication-grid.git
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page layout and controls |
| `styles.css` | Themes, grid layout, and print styles |
| `script.js` | Grid generation, scrambling, timer, and saved settings |

## License

[MIT](LICENSE)
