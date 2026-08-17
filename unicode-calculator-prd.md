# Product Requirements Document: Unicode Calculator

**Version:** 1.0
**Author:** William (Wai Yan Aung)
**Status:** Draft
**Last Updated:** July 3, 2026

---

## 1. Overview

A web-based calculator application capable of performing arithmetic on numbers written in any Unicode numeral system (Arabic-Indic, Devanagari, Bengali, Myanmar, Fullwidth, Roman numerals, superscript/subscript digits, circled numbers, etc.), not just standard ASCII 0-9. Users can type or paste expressions using digits from their native script and get correct results, optionally displayed back in their preferred numeral system.

## 2. Problem Statement

Standard calculators only accept ASCII digits (0-9). Users who think or write in non-Latin numeral systems (e.g., မြန်မာ (Myanmar), देवनागरी (Devanagari), 全角 (Fullwidth), or even Roman numerals) must manually transliterate before calculating. This app removes that friction by natively parsing and computing on Unicode numeric characters.

## 3. Goals

| Goal | Success Metric |
|---|---|
| Accept and correctly parse numbers in ≥10 Unicode numeral systems | 100% correct normalization in unit tests |
| Provide accurate arithmetic (incl. decimals) | Zero calculation errors vs. reference (decimal.js) |
| Fast round-trip (input → result) | < 200ms API response time |
| Simple deployment | Single `docker compose up` brings up full stack |

### Non-Goals
- No user accounts / auth in v1.
- No graphing or scientific/programmable calculator (v1 is basic arithmetic: +, −, ×, ÷, %, parentheses).
- No offline/PWA support in v1.

## 4. Target Users
- Multilingual users who natively write numbers in non-ASCII scripts.
- Developers/testers needing to validate Unicode-aware numeric input handling.
- General users wanting a clean, modern calculator UI.

## 5. Core Features

### 5.1 Unicode Numeral Input & Normalization
- Accepts digits from Unicode categories `Nd` (Decimal Number), plus common non-decimal numeral forms:
  - **Arabic-Indic**: ٠١٢٣٤٥٦٧٨٩
  - **Extended Arabic-Indic (Persian/Urdu)**: ۰۱۲۳۴۵۶۷۸۹
  - **Devanagari**: ०१२३४५६७८९
  - **Bengali**: ০১২৩৪৫৬৭৮৯
  - **Myanmar**: ၀၁၂၃၄၅၆၇၈၉
  - **Thai**: ๐๑๒๓๔๕๖๗๘๙
  - **Fullwidth**: ０１２３４５６７８９
  - **Superscript/Subscript digits**: ⁰¹²³⁴⁵⁶⁷⁸⁹ / ₀₁₂₃₄₅₆₇₈₉
  - **Circled digits**: ①②③④⑤⑥⑦⑧⑨
  - **Roman numerals**: I, V, X, L, C, D, M (integer-only, no decimals)
- Users can freely mix numeral systems within one expression (e.g., `१२ + ١٢`).
- Operators accepted in both ASCII (`+ - * / ( )`) and common Unicode math symbols (`× ÷ − ﹢`).
- Output can be displayed in ASCII by default, with a toggle to render results back into the input script's numeral system.

### 5.2 Calculator Operations (v1 scope)
- Addition, subtraction, multiplication, division
- Percentage (%)
- Parentheses / order of operations
- Decimal point support (where the numeral system has one; Roman numerals excluded)
- Positive/negative numbers
- Clear (C), All-clear (AC), Backspace

### 5.3 UI/UX
- Responsive calculator keypad (Next.js/React) usable on desktop and mobile.
- Live expression display + result display.
- Numeral-system selector/toggle (auto-detect by default, manual override available).
- Error state for invalid expressions (e.g., mismatched parentheses, divide by zero).
- History panel (session-only, in-memory — no persistence in v1).

### 5.4 Backend Calculation Service
- Stateless REST API that:
  1. Receives raw expression string (any mix of Unicode numerals/operators).
  2. Normalizes all numerals to a canonical decimal representation.
  3. Safely parses and evaluates the expression (no `eval()` — use a proper expression parser/AST).
  4. Returns result + normalized/echoed input for transparency.
- Uses arbitrary-precision decimal math (e.g., `decimal.js`) to avoid floating-point rounding errors.

## 6. System Architecture

```
┌─────────────────────┐        HTTPS/JSON       ┌──────────────────────┐
│   Next.js Frontend   │ ───────────────────────▶ │   Node.js Backend    │
│  (React, TypeScript) │ ◀─────────────────────── │  (Express/Fastify)   │
└─────────────────────┘                           └──────────────────────┘
        │                                                    │
        │ served via                                         │ business logic:
        │ Docker container (port 3000)                       │ - unicode-normalize
        │                                                     │ - expression parser
        │                                                     │ - decimal math engine
        │                                                     │
        └──────────────── docker-compose network ─────────────┘
                          (port 4000 for backend)
```

### 6.1 Frontend — Next.js
- Framework: Next.js 14+ (App Router), TypeScript, Tailwind CSS.
- Calls backend via `/api` proxy or direct fetch to backend service URL (env-configured).
- Client-side pre-validation for instant UX feedback; authoritative calculation always happens server-side.

### 6.2 Backend — Node.js
- Framework: Express or Fastify (TypeScript).
- Key modules:
  - `unicode-normalizer`: maps any supported Unicode numeral char → ASCII digit, using Unicode code point ranges/lookup tables.
  - `tokenizer` + `parser`: builds an AST from the normalized expression (handles operator precedence, parentheses).
  - `evaluator`: walks AST using `decimal.js` for precision-safe math.
  - `formatter`: converts result back to requested numeral system for display.
- Exposes REST endpoint(s), see §7.

## 7. API Specification

### `POST /api/calculate`

**Request:**
```json
{
  "expression": "१२३ + ٤٥٦ × (2 − 1)",
  "outputNumeralSystem": "ascii"   // optional: "ascii" | "devanagari" | "myanmar" | "auto" | ...
}
```

**Response (200):**
```json
{
  "success": true,
  "normalizedExpression": "123 + 456 * (2 - 1)",
  "result": "579",
  "formattedResult": "579",
  "detectedNumeralSystems": ["devanagari", "arabic-indic"]
}
```

**Response (400 — invalid input):**
```json
{
  "success": false,
  "error": "UNBALANCED_PARENTHESES",
  "message": "Expression has mismatched parentheses."
}
```

### `GET /api/health`
Simple liveness check returning `{ "status": "ok" }` for Docker healthchecks.

## 8. Data Model
No persistent database required for v1 (stateless calculation service). Calculation history, if added, lives in frontend session state only.

*(Future v2 consideration: optional PostgreSQL for saved history per user — out of scope now.)*

## 9. Non-Functional Requirements
- **Performance**: API responses < 200ms for expressions up to 200 characters.
- **Security**: No `eval()`/`Function()` on user input; strict AST-based evaluation only. Input length capped (e.g., 500 chars) to prevent abuse. Rate limiting on the API (e.g., 60 req/min/IP).
- **Reliability**: Backend returns structured error codes for all failure modes (invalid char, div-by-zero, overflow, unbalanced parens).
- **Portability**: Fully containerized; runs identically in dev/prod via Docker Compose.
- **Accessibility**: Calculator UI keyboard-navigable, ARIA labels on buttons.

## 10. Docker Compose Setup

```yaml
version: "3.9"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000
    depends_on:
      - backend
    networks:
      - calc-net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks:
      - calc-net

networks:
  calc-net:
    driver: bridge
```

**Repo structure:**
```
/frontend    → Next.js app, own Dockerfile
/backend     → Node.js API, own Dockerfile
docker-compose.yml
```

## 11. Edge Cases & Error Handling
| Case | Expected Behavior |
|---|---|
| Mixed numeral systems in one expression | Normalize and calculate correctly |
| Division by zero | Return `DIVISION_BY_ZERO` error, no crash |
| Unsupported/unmapped character | Return `INVALID_CHARACTER` error with the offending char |
| Unbalanced parentheses | Return `UNBALANCED_PARENTHESES` error |
| Roman numeral + decimal point | Return `UNSUPPORTED_OPERATION` (Roman numerals are integer-only) |
| Extremely long input | Reject with `INPUT_TOO_LONG` (>500 chars) |
| Empty expression | Return `EMPTY_EXPRESSION` error |

## 12. Milestones / Rollout Plan
1. **M1** — Core normalization library + unit tests (all numeral systems).
2. **M2** — Backend API with parser/evaluator + integration tests.
3. **M3** — Frontend calculator UI wired to API.
4. **M4** — Docker Compose integration, healthchecks, README.
5. **M5** — QA pass on edge cases, accessibility review, launch.

## 13. Open Questions
- Should the app auto-detect numeral system per-token, or require one system per expression?
- Do we need i18n for UI labels beyond numeral support (e.g., Burmese/English UI toggle)?
- Is a calculation history with persistence needed for v2?

## 14. Tech Stack Summary
| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Node.js, Express/Fastify, TypeScript |
| Math Engine | decimal.js (arbitrary precision) |
| Containerization | Docker, Docker Compose |
| Testing | Jest (unit), Playwright/Supertest (integration) |
