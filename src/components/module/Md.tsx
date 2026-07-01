import type { ReactNode } from 'react';

/*
 * Markdown-lite: paragraphs split on blank lines; inline `code`, **bold**, *italic*.
 * Content is authored in src/data, so the supported subset is deliberately small.
 */
const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

function renderInline(text: string, keyBase: string): ReactNode[] {
  return text
    .split(INLINE)
    .filter((p) => p !== '')
    .map((part, i) => {
      const key = `${keyBase}-${i}`;
      if (part.startsWith('`') && part.endsWith('`')) return <code key={key}>{part.slice(1, -1)}</code>;
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={key}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*')) return <em key={key}>{part.slice(1, -1)}</em>;
      return <span key={key}>{part}</span>;
    });
}

export function Md({ text, className }: { text: string; className?: string }) {
  const paras = text.split(/\n\n+/);
  return (
    <div className={className}>
      {paras.map((p, i) => (
        <p key={i}>{renderInline(p, String(i))}</p>
      ))}
    </div>
  );
}

// CHANGED (S9): inline-only variant (no <p> wrapper) — for chip/label/inline contexts such as the
// #/decide picker option labels, where inline `code` should render but a block paragraph should not.
export function MdInline({ text }: { text: string }) {
  return <>{renderInline(text, 'i')}</>;
}
