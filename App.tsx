
import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { TranscriptPreviewModal } from './components/TranscriptPreviewModal';
import { generateProjectAnalysis, startChat } from './services/geminiService';
import { saveAnalysisAndFirstMessage, saveChatMessage } from './services/supabaseService';
import { type AnalysisOutput, type ChatMessage } from './types';
import { MOCK_INPUT } from './constants';
import { type Chat } from '@google/genai';

const App: React.FC = () => {
  const [projectName, setProjectName] = useState<string>(MOCK_INPUT.projectName);
  const [meetingText, setMeetingText] = useState<string>(""); // Start with empty meeting text
  const [optionalComments, setOptionalComments] = useState<string>(MOCK_INPUT.optionalComments);
  const [fileName, setFileName] = useState<string | null>(null); // State for uploaded file name
  const [analysisResult, setAnalysisResult] = useState<AnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  
  // State for Supabase integration
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  
  // State for Audio Transcription
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptPreview, setTranscriptPreview] = useState<string | null>(null);
  const [showTranscriptModal, setShowTranscriptModal] = useState<boolean>(false);

  const handleGenerateAnalysis = async () => {
    if (!projectName || !meetingText) {
      setError("Project Name and a document upload are required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setChatSession(null);
    setChatMessages([]);
    setCurrentAnalysisId(null);

    try {
      const result = await generateProjectAnalysis(projectName, meetingText, optionalComments);
      setAnalysisResult(result);
      const { chat: newChatSession, initialHistory } = startChat(result.project_brain);
      setChatSession(newChatSession);

      // We only show the model's greeting, not the hidden context prompt
      const visibleHistory = initialHistory.slice(1);
      setChatMessages(visibleHistory);

      // Save to Supabase. This function now throws a detailed error on failure.
      if(visibleHistory.length > 0) {
          const { analysisId } = await saveAnalysisAndFirstMessage(result, visibleHistory[0]);
          setCurrentAnalysisId(analysisId);
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!chatSession || isChatLoading) return;

    setIsChatLoading(true);
    
    const newUserMessage: ChatMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, newUserMessage, { role: 'model', content: '' }]);

    if (currentAnalysisId) {
      await saveChatMessage(currentAnalysisId, newUserMessage);
    }

    try {
      const stream = await chatSession.sendMessageStream({ message });
      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setChatMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1].content = fullResponse;
          }
          return newMessages;
        });
      }

      if (currentAnalysisId) {
        await saveChatMessage(currentAnalysisId, { role: 'model', content: fullResponse });
      }

    } catch(err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during chat.";
        setChatMessages(prev => {
           const newMessages = [...prev];
           if (newMessages.length > 0) {
             newMessages[newMessages.length - 1].content = `Error: ${errorMessage}`;
           }
           return newMessages;
        });
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleReset = () => {
    setProjectName(MOCK_INPUT.projectName);
    setMeetingText("");
    setOptionalComments(MOCK_INPUT.optionalComments);
    setFileName(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    setChatSession(null);
    setChatMessages([]);
    setIsChatLoading(false);
    setCurrentAnalysisId(null);
    setIsTranscribing(false);
    setTranscriptPreview(null);
    setShowTranscriptModal(false);
  };

  // Simulate transcription for audio files
  const handleAudioUpload = (file: File) => {
    handleReset(); // Reset previous state
    setFileName(file.name);
    setIsTranscribing(true);
    
    // In a real app, you would call a Speech-to-Text API here.
    // For this demo, we'll simulate the process.
    setTimeout(() => {
        const sampleTranscript = `Project Kick-off Meeting Notes\n\nDate: Today\n\nAttendees: Alex (PM), Brenda (Dev Lead), Carlos (UX Designer)\n\nAgenda:\n1.  Project Goals and Scope\n2.  Technical Stack Discussion\n3.  Timeline and Milestones\n\nKey Discussion Points:\n- Alex outlined the primary goal: Launch the new user dashboard by end of Q4. The scope includes user authentication, a customizable widget area, and an admin panel.\n- Brenda confirmed the team will use a React frontend with a Node.js backend. She raised a potential risk regarding third-party API rate limits and suggested we need a caching strategy. This is a high-priority action item for her team.\n- Carlos presented the initial wireframes. The team agreed on the general layout but decided to conduct user testing on the navigation flow. Carlos will schedule these sessions within the next two weeks.\n\nAction Items:\n- (AI-1) Brenda's team to investigate and document a caching strategy for the third-party API. Due: Next Friday.\n- (AI-2) Carlos to schedule and conduct user testing for the navigation wireframes. Due: In two weeks.\n- (AI-3) Alex to finalize the detailed project plan and share it with stakeholders. Due: End of this week.`;
        
        setTranscriptPreview(sampleTranscript);
        setIsTranscribing(false);
        setShowTranscriptModal(true);
    }, 3000); // Simulate a 3-second transcription time
  };
  
  const handleConfirmTranscript = (transcript: string) => {
      setMeetingText(transcript);
      setShowTranscriptModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <InputPanel
          projectName={projectName}
          setProjectName={setProjectName}
          setMeetingText={setMeetingText}
          fileName={fileName}
          setFileName={setFileName}
          optionalComments={optionalComments}
          setOptionalComments={setOptionalComments}
          onGenerate={handleGenerateAnalysis}
          onReset={handleReset}
          isLoading={isLoading || isTranscribing}
          onAudioFileSelected={handleAudioUpload}
        />
        <OutputPanel
          result={analysisResult}
          isLoading={isLoading}
          isTranscribing={isTranscribing}
          error={error}
          chatMessages={chatMessages}
          isChatLoading={isChatLoading}
          onSendMessage={handleSendMessage}
        />
      </main>
      {showTranscriptModal && transcriptPreview && (
        <TranscriptPreviewModal 
            transcript={transcriptPreview}
            onConfirm={handleConfirmTranscript}
            onCancel={() => {
                setShowTranscriptModal(false);
                handleReset();
            }}
        />
      )}
    </div>
  );
};

export default App;
