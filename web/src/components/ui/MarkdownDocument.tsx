import React from 'react';

interface MarkdownDocumentProps {
  content: string;
}

/** Lightweight Markdown renderer for study documents */
export const MarkdownDocument: React.FC<MarkdownDocumentProps> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <article className="space-y-3 text-gray-200 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={i} className="text-2xl font-extrabold text-white mt-6 mb-2">
              {trimmed.slice(2)}
            </h1>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="text-xl font-bold text-white mt-5 mb-2 border-b border-white/10 pb-2">
              {trimmed.slice(3)}
            </h2>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="text-lg font-semibold text-indigo-300 mt-4 mb-1">
              {trimmed.slice(4)}
            </h3>
          );
        }
        if (trimmed === '---') {
          return <hr key={i} className="border-white/10 my-4" />;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const text = trimmed.slice(2);
          return (
            <li key={i} className="ml-4 list-disc text-gray-300">
              <InlineMarkdown text={text} />
            </li>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <li key={i} className="ml-4 list-decimal text-gray-300">
              <InlineMarkdown text={trimmed.replace(/^\d+\.\s/, '')} />
            </li>
          );
        }
        if (trimmed.startsWith('|') && trimmed.includes('|')) {
          return (
            <p key={i} className="font-mono text-xs text-gray-400 overflow-x-auto">
              {trimmed}
            </p>
          );
        }
        if (!trimmed) {
          return <div key={i} className="h-2" />;
        }
        if (trimmed.startsWith('_') && trimmed.endsWith('_')) {
          return (
            <p key={i} className="text-xs text-muted-foreground-dark italic">
              {trimmed.slice(1, -1)}
            </p>
          );
        }

        return (
          <p key={i} className="text-gray-300">
            <InlineMarkdown text={trimmed} />
          </p>
        );
      })}
    </article>
  );
};

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="text-white font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          return (
            <a
              key={i}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline"
            >
              {linkMatch[1]}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
