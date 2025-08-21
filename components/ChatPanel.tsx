
import React, { useState, useRef, useEffect } from 'react';
import { type ChatMessage } from '../types';
import { Loader } from './Loader';
import { MarkdownRenderer } from './MarkdownRenderer';

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const ModelIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const suggestedPrompts = [
    "List all action items.",
    "What are the main risks?",
    "Summarize the key decisions.",
    "Who is responsible for what?"
];

interface ChatPanelProps {
    messages: ChatMessage[];
    isChatLoading: boolean;
    onSendMessage: (message: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isChatLoading, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isChatLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    const handlePromptClick = (prompt: string) => {
        if (!isChatLoading) {
            onSendMessage(prompt);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-800/70 rounded-b-lg">
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             {msg.role === 'model' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                    <ModelIcon />
                                </div>
                             )}
                             
                             <div className={`p-3 rounded-lg max-w-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-300 rounded-bl-none'}`}>
                                {msg.role === 'model' ? (
                                    <MarkdownRenderer content={msg.content + (isChatLoading && index === messages.length - 1 ? '▍' : '')} />
                                ) : (
                                    <p>{msg.content}</p>
                                )}
                             </div>

                             {msg.role === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                                    <UserIcon />
                                </div>
                             )}
                        </div>
                    ))}
                </div>

                {messages.length === 1 && messages[0].role === 'model' && !isChatLoading && (
                    <div className="my-6">
                        <p className="text-sm text-slate-400 mb-3 text-center">Or try one of these suggestions:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {suggestedPrompts.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePromptClick(prompt)}
                                    disabled={isChatLoading}
                                    className="p-3 bg-slate-700/50 border border-slate-600/80 rounded-lg text-sm text-left text-slate-300 hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-700 bg-slate-800/50 rounded-b-lg">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a follow-up question..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 pr-14 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 disabled:opacity-50"
                        disabled={isChatLoading}
                        aria-label="Chat input"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isChatLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-9 w-9 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-indigo-500 disabled:bg-indigo-900/50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200"
                        aria-label="Send message"
                    >
                         {isChatLoading ? <Loader size="sm" /> : 
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                         </svg>
                         }
                    </button>
                </form>
            </div>
        </div>
    );
};