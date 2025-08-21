
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          <span className="text-indigo-400">AI</span> Project Assistant
        </h1>
        <p className="text-sm text-slate-400">
          Meeting & Document Analysis powered by Gemini
        </p>
      </div>
    </header>
  );
};
