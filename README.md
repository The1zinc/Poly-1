# Poly-1

## Advanced Calculator (Vercel-ready)

This project is a fully client-side advanced calculator with scientific functions, percentage handling,
constants, memory keys, angle toggles (DEG/RAD), history, and keyboard support. It is designed to deploy
directly to Vercel as a static site.

## Contents

- [Local Development](#local-development)
- [Deploy to Vercel](#deploy-to-vercel)

## Feature Highlights

- Scientific operators (`sin`, `cos`, `tan`, `log`, `ln`, `sqrt`, `pow`, `abs`).
- Constants and helpers (`π`, `e`, factorial, and percent shortcuts).
- Built-in memory controls with a compact six-item calculation history.

## Local Development

You can open `index.html` directly in the browser, or run a small static server:

```bash
python -m http.server 5173
```

Then open `http://localhost:5173`.

## Keyboard Shortcuts

- `Enter`: evaluate expression
- `Backspace`: delete last character
- `Escape`: clear current expression
- Numeric keys and basic operators map directly to calculator input

## Memory Controls

- `MC` resets memory to zero.
- `MR` inserts the current memory value into the expression.
- `M+` and `M-` use the latest computed result.

## Expression Tips

- Use either `x^y` or `pow(x, y)` for exponentiation.
- Factorial works on non-negative integers only.
- Percent input is converted internally to `/100`.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, click **Add New Project** and import the repo.
3. Choose **Other** framework preset (static) and keep defaults.
4. Deploy.

No build step is required because the app is pure HTML/CSS/JS.
