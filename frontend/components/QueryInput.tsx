"use client";

import { useRef } from "react";

const EXAMPLES = [
  "Should I buy NVDA?",
  "Compare AAPL and MSFT",
  "What's the risk on TSLA right now?",
];

export default function QueryInput({
  value,
  onChange,
  onSubmit,
  disabled,
  showExamples,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  showExamples: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="w-full">
      {showExamples && (
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onChange(ex)}
              className="rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-xs text-text-muted transition-colors hover:border-gold/40 hover:text-gold"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          if (!disabled && value.trim()) onSubmit();
        }}
        className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] focus-within:border-gold/40"
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!disabled && value.trim()) onSubmit();
            }
          }}
          placeholder="Ask the desk about a stock…"
          rows={1}
          disabled={disabled}
          className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-[15px] text-text placeholder:text-text-faint focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="shrink-0 rounded-xl bg-gold px-4 py-2.5 font-mono text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          {disabled ? "Working…" : "Ask"}
        </button>
      </form>
    </div>
  );
}