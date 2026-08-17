'use client';

import { calculateExpression } from '@/lib/api';
import { ERROR_MESSAGES, NUMERAL_SYSTEMS, OUTPUT_SYSTEM_OPTIONS, getNumeralSystem } from '@/lib/numeralSystems';
import { useState } from 'react';

interface HistoryEntry {
  expression: string;
  formattedResult: string;
}

const ROMAN_LETTERS = ['I', 'V', 'X', 'L', 'C', 'D', 'M'];

export default function Calculator() {
  const [expression, setExpression] = useState('');
  const [inputSystemId, setInputSystemId] = useState('ascii');
  const [outputSystemId, setOutputSystemId] = useState('auto');
  const [result, setResult] = useState<string | null>(null);
  const [detectedSystems, setDetectedSystems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const inputSystem = getNumeralSystem(inputSystemId);

  function append(token: string) {
    setError(null);
    setExpression((prev) => prev + token);
  }

  function handleAllClear() {
    setExpression('');
    setResult(null);
    setDetectedSystems([]);
    setError(null);
  }

  function handleClear() {
    setExpression('');
    setError(null);
  }

  function handleBackspace() {
    setError(null);
    setExpression((prev) => Array.from(prev).slice(0, -1).join(''));
  }

  async function handleEquals() {
    if (!expression.trim()) {
      setError(ERROR_MESSAGES.EMPTY_EXPRESSION);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await calculateExpression(expression, outputSystemId);
      if (response.success) {
        setResult(response.formattedResult);
        setDetectedSystems(response.detectedNumeralSystems);
        setHistory((prev) => [{ expression, formattedResult: response.formattedResult }, ...prev].slice(0, 20));
      } else {
        setResult(null);
        setError(ERROR_MESSAGES[response.error] ?? response.message);
      }
    } catch {
      setResult(null);
      setError('Could not reach the calculation service. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleEquals();
    }
  }

  return (
    <main className="w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-xl">
      <h1 className="mb-4 text-center text-xl font-semibold">Unicode Calculator</h1>

      <div className="mb-3 flex gap-2 text-sm">
        <label className="flex-1">
          <span className="mb-1 block text-slate-300">Keypad script</span>
          <select
            aria-label="Keypad numeral system"
            className="w-full rounded-md bg-slate-700 p-2"
            value={inputSystemId}
            onChange={(e) => setInputSystemId(e.target.value)}
          >
            {NUMERAL_SYSTEMS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-slate-300">Output script</span>
          <select
            aria-label="Output numeral system"
            className="w-full rounded-md bg-slate-700 p-2"
            value={outputSystemId}
            onChange={(e) => setOutputSystemId(e.target.value)}
          >
            {OUTPUT_SYSTEM_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <input
        aria-label="Expression"
        className="mb-2 w-full rounded-md bg-slate-900 p-3 text-right text-lg tracking-wide outline-none ring-1 ring-slate-700 focus:ring-blue-500"
        value={expression}
        placeholder="0"
        onChange={(e) => setExpression(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div
        aria-live="polite"
        className="mb-4 min-h-[2.5rem] rounded-md bg-slate-900/50 p-2 text-right text-2xl font-bold"
      >
        {loading ? '…' : result !== null ? result : ' '}
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-md bg-red-900/60 p-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {detectedSystems.length > 0 && !error && (
        <p className="mb-3 text-xs text-slate-400">
          Detected: {detectedSystems.join(', ')}
        </p>
      )}

      <div className="mb-3 grid grid-cols-4 gap-2" role="group" aria-label="Calculator keypad">
        <button
          aria-label="All clear"
          className="rounded-md bg-red-700 p-3 font-semibold hover:bg-red-600"
          onClick={handleAllClear}
        >
          AC
        </button>
        <button
          aria-label="Clear entry"
          className="rounded-md bg-slate-600 p-3 font-semibold hover:bg-slate-500"
          onClick={handleClear}
        >
          C
        </button>
        <button
          aria-label="Backspace"
          className="rounded-md bg-slate-600 p-3 font-semibold hover:bg-slate-500"
          onClick={handleBackspace}
        >
          ⌫
        </button>
        <button
          aria-label="Percent"
          className="rounded-md bg-slate-600 p-3 font-semibold hover:bg-slate-500"
          onClick={() => append('%')}
        >
          %
        </button>

        <button
          aria-label="Open parenthesis"
          className="rounded-md bg-slate-700 p-3 hover:bg-slate-600"
          onClick={() => append('(')}
        >
          (
        </button>
        <button
          aria-label="Close parenthesis"
          className="rounded-md bg-slate-700 p-3 hover:bg-slate-600"
          onClick={() => append(')')}
        >
          )
        </button>
        <button
          aria-label="Divide"
          className="rounded-md bg-orange-600 p-3 font-semibold hover:bg-orange-500"
          onClick={() => append('÷')}
        >
          ÷
        </button>
        <button
          aria-label="Multiply"
          className="rounded-md bg-orange-600 p-3 font-semibold hover:bg-orange-500"
          onClick={() => append('×')}
        >
          ×
        </button>

        {inputSystem.digits ? (
          <>
            {(() => {
              const digits = inputSystem.digits!;
              return (
                <>
                  {['7', '8', '9'].map((d, idx) => (
                    <button
                      key={d}
                      aria-label={`Digit ${d}`}
                      className="rounded-md bg-slate-700 p-3 text-lg hover:bg-slate-600"
                      onClick={() => append(digits[7 + idx])}
                    >
                      {digits[7 + idx]}
                    </button>
                  ))}
                  <button
                    aria-label="Subtract"
                    className="rounded-md bg-orange-600 p-3 font-semibold hover:bg-orange-500"
                    onClick={() => append('−')}
                  >
                    −
                  </button>

                  {['4', '5', '6'].map((d, idx) => (
                    <button
                      key={d}
                      aria-label={`Digit ${d}`}
                      className="rounded-md bg-slate-700 p-3 text-lg hover:bg-slate-600"
                      onClick={() => append(digits[4 + idx])}
                    >
                      {digits[4 + idx]}
                    </button>
                  ))}
                  <button
                    aria-label="Add"
                    className="rounded-md bg-orange-600 p-3 font-semibold hover:bg-orange-500"
                    onClick={() => append('+')}
                  >
                    +
                  </button>

                  {['1', '2', '3'].map((d, idx) => (
                    <button
                      key={d}
                      aria-label={`Digit ${d}`}
                      className="rounded-md bg-slate-700 p-3 text-lg hover:bg-slate-600"
                      onClick={() => append(digits[1 + idx])}
                    >
                      {digits[1 + idx]}
                    </button>
                  ))}
                  <button
                    aria-label="Equals"
                    className="row-span-2 rounded-md bg-blue-600 p-3 font-semibold hover:bg-blue-500"
                    onClick={handleEquals}
                  >
                    =
                  </button>

                  <button
                    aria-label="Digit 0"
                    className="col-span-2 rounded-md bg-slate-700 p-3 text-lg hover:bg-slate-600"
                    onClick={() => append(digits[0])}
                  >
                    {digits[0]}
                  </button>
                </>
              );
            })()}
            <button
              aria-label="Decimal point"
              className="rounded-md bg-slate-700 p-3 text-lg hover:bg-slate-600"
              onClick={() => append('.')}
            >
              .
            </button>
          </>
        ) : (
          <>
            {ROMAN_LETTERS.map((letter) => (
              <button
                key={letter}
                aria-label={`Roman numeral ${letter}`}
                className="rounded-md bg-slate-700 p-3 text-lg hover:bg-slate-600"
                onClick={() => append(letter)}
              >
                {letter}
              </button>
            ))}
            <button
              aria-label="Subtract"
              className="rounded-md bg-orange-600 p-3 font-semibold hover:bg-orange-500"
              onClick={() => append('−')}
            >
              −
            </button>
            <button
              aria-label="Add"
              className="rounded-md bg-orange-600 p-3 font-semibold hover:bg-orange-500"
              onClick={() => append('+')}
            >
              +
            </button>
            <button
              aria-label="Equals"
              className="col-span-2 rounded-md bg-blue-600 p-3 font-semibold hover:bg-blue-500"
              onClick={handleEquals}
            >
              =
            </button>
          </>
        )}
      </div>

      {history.length > 0 && (
        <div className="mt-4 max-h-40 overflow-y-auto rounded-md bg-slate-900/50 p-2 text-sm">
          <h2 className="mb-1 font-semibold text-slate-300">History</h2>
          <ul>
            {history.map((h, i) => (
              <li key={i} className="flex justify-between border-b border-slate-800 py-1 last:border-0">
                <span className="text-slate-400">{h.expression}</span>
                <span className="font-medium">{h.formattedResult}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
