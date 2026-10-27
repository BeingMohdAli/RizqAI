"use client";

import { useRef, useEffect } from "react";

interface WorkspaceInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function WorkspaceInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: WorkspaceInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center gap-2 rounded-2xl border border-[#1a283e] bg-[#0c1421]/95 px-3.5 py-2.5 shadow-2xl shadow-black/60 backdrop-blur-xl focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
        {/* Left Attachment Button */}
        <button
          type="button"
          title="Attach document or ticker"
          className="flex h-8 w-8 items-center justify-center rounded-xl text-text-faint hover:bg-[#142032] hover:text-text-muted transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        {/* Input Text Box */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask a question about stocks, markets, or financial concepts..."
          className="flex-1 bg-transparent text-sm text-text placeholder-text-faint focus:outline-none disabled:opacity-50"
        />

        {/* Submit Button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400 text-[#070c14] shadow-md shadow-emerald-400/20 hover:bg-emerald-300 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          {disabled ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#070c14] border-t-transparent" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
