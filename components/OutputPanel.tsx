
import React, { useState } from 'react';
import { type AnalysisOutput, type ChatMessage } from '../types';
import { Loader } from './Loader';
import { ErrorDisplay } from './ErrorDisplay';
import { StructuredOutput } from './StructuredOutput';
import { ChatPanel } from './ChatPanel';

interface OutputPanelProps {
  result: AnalysisOutput | null;
  isLoading: boolean;
  isTranscribing: boolean;
  error: string | null;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  onSendMessage: (message: string) => void;
}

type ActiveTab = 'analysis' | 'chat';

export const OutputPanel: React.FC<OutputPanelProps> = ({ result, isLoading, isTranscribing, error, chatMessages, isChatLoading, onSendMessage }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('analysis');

  const renderContent = () => {
    if (isTranscribing) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <Loader size="lg"/>
          <p className="mt-4 text-lg">Transcribing audio...</p>
          <p className="text-sm text-slate-500">This may take a moment. (This is a simulation)</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <Loader size="lg"/>
          <p className="mt-4 text-lg">Analyzing document...</p>
          <p className="text-sm text-slate-500">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return <ErrorDisplay message={error} />;
    }

    if (result) {
      return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 border-b border-slate-700 px-4">
                <nav className="-mb-px flex space-x-6">
                     <button
                        onClick={() => setActiveTab('analysis')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                            activeTab === 'analysis'
                            ? 'border-indigo-500 text-indigo-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                        }`}
                        aria-current={activeTab === 'analysis' ? 'page' : undefined}
                    >
                        Analysis
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        disabled={!result}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            activeTab === 'chat'
                            ? 'border-indigo-500 text-indigo-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                        }`}
                         aria-current={activeTab === 'chat' ? 'page' : undefined}
                    >
                        Chat
                    </button>
                </nav>
            </div>
            <div className="flex-grow min-h-0">
                {activeTab === 'analysis' && <StructuredOutput result={result} />}
                {activeTab === 'chat' && (
                    <ChatPanel messages={chatMessages} isChatLoading={isChatLoading} onSendMessage={onSendMessage} />
                )}
            </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-slate-400">Analysis Results</h3>
        <p className="mt-1">Fill out the form and click "Generate Analysis" to see the output here.</p>
      </div>
    );
  };
  
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg min-h-[500px] lg:h-full flex flex-col">
       {renderContent()}
    </div>
  );
};
