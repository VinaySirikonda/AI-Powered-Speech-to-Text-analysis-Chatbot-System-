import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Use a regex to add a non-breaking space to the flashing cursor to prevent layout shifts
  const processedContent = content.replace(/▍/g, ' ▍');

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-base font-semibold my-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2 pl-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2 pl-2" {...props} />,
        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <pre className="bg-slate-900/80 p-3 rounded-md my-2 overflow-x-auto text-sm font-mono"><code className={className} {...props}>{children}</code></pre>
            ) : (
              <code className="bg-slate-900/80 text-indigo-300 px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>{children}</code>
            )
        },
        a: ({ node, ...props }) => <a className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-slate-600 pl-4 my-2 italic text-slate-400" {...props} />,
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};
