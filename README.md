# Unicode Calculator

A calculator that computes on numbers written in **any Unicode numeral system** — Arabic-Indic, Devanagari, Bengali, Myanmar, Thai, Fullwidth, superscript/subscript, circled digits, and Roman numerals — not just ASCII `0-9`. Type an expression in your native script and get an accurate result, computed server-side with arbitrary-precision decimal math.

```
१२३ + ٤٥٦ × (2 − 1)  →  579
```

## Why

Most calculators only accept ASCII digits, forcing anyone who thinks or writes in a non-Latin numeral system to transliterate by hand before they can calculate. This app removes that step by parsing Unicode numerals natively and letting you mix numeral systems freely within a single expression.

## Features

- Accepts digits from 10+ Unicode numeral systems, mixed freely in one expression (e.g. `१२ + ١٢`)
- Both ASCII (`+ - * /`) and Unicode math operators (`× ÷ −`) supported
- Arithmetic with decimals, percentages, parentheses, and operator precedence
- Results can be echoed back in the input's numeral system
- No `eval()` — expressions are tokenized and parsed into an AST, then evaluated with [decimal.js](https://github.com/MikeMcl/decimal.js) for precision-safe math
- Structured error handling (unbalanced parentheses, division by zero, invalid characters, etc.)
- Fully containerized — one command brings up the full stack

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Math Engine | decimal.js (arbitrary precision) |
| Testing | Jest, Supertest |
| Containerization | Docker, Docker Compose |

## Architecture

```
┌─────────────────────┐        HTTPS/JSON       ┌──────────────────────┐
│   Next.js Frontend   │ ───────────────────────▶│   Node.js Backend    │
│  (React, TypeScript) │◀─────────────────────── │     (Express)        │
└─────────────────────┘                          └──────────────────────┘
      port 3000                                          port 4000
```

The backend does the real work in four stages:

1. **`unicode-normalizer`** — maps any supported Unicode numeral character to its ASCII digit
2. **`tokenizer` + `parser`** — builds an AST from the normalized expression, honoring operator precedence and parentheses
3. **`evaluator`** — walks the AST using `decimal.js` for precision-safe math
4. **`formatter`** — converts the result back into the requested numeral system for display

See [unicode-calculator-prd.md](unicode-calculator-prd.md) for the full product spec, including the API contract and edge-case matrix.

## Getting Started

### Run with Docker (recommended)

```bash
docker compose up
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000](http://localhost:4000)

### Run locally

**Backend**
```bash
cd backend
npm install
npm run dev      # http://localhost:4000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
```

### Run tests

```bash
cd backend
npm test
```

## API

### `POST /api/calculate`

**Request**
```json
{
  "expression": "१२३ + ٤٥٦ × (2 − 1)",
  "outputNumeralSystem": "ascii"
}
```

**Response**
```json
{
  "success": true,
  "normalizedExpression": "123 + 456 * (2 - 1)",
  "result": "579",
  "formattedResult": "579",
  "detectedNumeralSystems": ["devanagari", "arabic-indic"]
}
```

### `GET /api/health`

Liveness check used by the Docker healthcheck, returns `{ "status": "ok" }`.

## Project Structure

```
frontend/    Next.js app (calculator UI)
backend/     Express API (normalization, parsing, evaluation)
docker-compose.yml
```

## License

MIT
