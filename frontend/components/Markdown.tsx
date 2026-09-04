"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const blockComponents: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-text">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-snug">{children}</li>,
  h1: ({ children }) => (
    <h3 className="mb-2 mt-4 font-display text-base font-semibold text-text first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 mt-4 font-display text-base font-semibold text-text first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-1.5 mt-3 font-display text-sm font-semibold text-gold first:mt-0">
      {children}
    </h4>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gold underline underline-offset-2 hover:text-gold/80"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-ink-raised px-1 py-0.5 font-mono text-[13px] text-gold">
      {children}
    </code>
  ),
  hr: () => <hr className="my-4 border-line-soft" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-gold/40 pl-3 italic text-text-muted">
      {children}
    </blockquote>
  ),
};

// For short, single-line strings (list items) where we don't want the
// block-level <p> margin react-markdown would otherwise add.
const inlineComponents: Components = {
  ...blockComponents,
  p: ({ children }) => <>{children}</>,
};

export default function Markdown({
  content,
  inline = false,
  className = "",
}: {
  content: string;
  inline?: boolean;
  className?: string;
}) {
  return (
  <div className={`break-words ${className}`}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={inline ? inlineComponents : blockComponents}
    >
      {content}
    </ReactMarkdown>
  </div>
);
}