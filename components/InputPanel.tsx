
import React, { useState, useRef, useCallback } from 'react';
import { Loader } from './Loader';
import mammoth from 'mammoth';

interface InputPanelProps {
  projectName: string;
  setProjectName: (value: string) => void;
  setMeetingText: (value: string) => void;
  fileName: string | null;
  setFileName: (name: string | null) => void;
  optionalComments: string;
  setOptionalComments: (value: string) => void;
  onGenerate: () => void;
  onReset: () => void;
  isLoading: boolean;
  onAudioFileSelected: (file: File) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  projectName,
  setProjectName,
  setMeetingText,
  fileName,
  setFileName,
  optionalComments,
  setOptionalComments,
  onGenerate,
  onReset,
  isLoading,
  onAudioFileSelected,
}) => {
  const commonInputClasses = "w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File | null) => {
    if (file) {
      // Handle audio files
      if (file.type.startsWith('audio/')) {
        onAudioFileSelected(file);
        return;
      }
      
      // Handle text and docx files
      if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setMeetingText(text);
          setFileName(file.name);
        };
        reader.readAsText(file);
      } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const reader = new FileReader();
        reader.onload = async (e) => {
            if (e.target?.result) {
                try {
                    const result = await mammoth.extractRawText({ arrayBuffer: e.target.result as ArrayBuffer });
                    setMeetingText(result.value);
                    setFileName(file.name);
                } catch (error) {
                    console.error("Error parsing .docx file:", error);
                    alert("Could not read the .docx file. Please ensure it is not corrupted.");
                    setFileName(null);
                }
            }
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("Please upload a valid text (.txt, .md), document (.docx), or audio (.mp3, .wav, .m4a) file.");
      }
    }
  }, [setMeetingText, setFileName, onAudioFileSelected]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
        handleFile(e.target.files[0]);
     }
  };

  const handleRemoveFile = () => {
    onReset();
  };


  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex flex-col gap-6 h-full">
      <h2 className="text-xl font-semibold text-slate-100 border-b border-slate-700 pb-3">Input Data</h2>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="projectName" className="text-sm font-medium text-slate-300">Project Name</label>
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className={commonInputClasses}
          placeholder="e.g., Q3 Product Launch"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col gap-2 flex-grow min-h-[150px]">
        <label htmlFor="file-upload" className="text-sm font-medium text-slate-300">Document or Audio Upload</label>
         <input 
            type="file" 
            id="file-upload" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept="text/*,.md,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,audio/*"
            disabled={isLoading}
         />
        {!fileName ? (
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${isDragging ? 'border-indigo-500 bg-indigo-900/20' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'}`}
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-slate-400"><span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">Audio, DOCX, TXT, or MD files</p>
            </div>
        ) : (
             <div className="flex-grow flex items-center justify-between bg-slate-800 border border-slate-700 rounded-md p-3 text-slate-300">
                <div className="flex items-center gap-3 overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate font-medium" title={fileName}>{fileName}</span>
                </div>
                <button
                    onClick={handleRemoveFile}
                    disabled={isLoading}
                    className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors duration-200 p-1 rounded-full hover:bg-slate-700"
                    aria-label="Remove file"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        )}
      </div>
      
      <div className="flex flex-col gap-2 min-h-[150px]">
        <label htmlFor="optionalComments" className="text-sm font-medium text-slate-300">Optional Team Comments</label>
        <textarea
          id="optionalComments"
          value={optionalComments}
          onChange={(e) => setOptionalComments(e.target.value)}
          className={`${commonInputClasses} flex-grow resize-none`}
          placeholder="[Author]: [Comment]..."
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-2">
        <button
          onClick={onGenerate}
          disabled={isLoading || !projectName || !fileName}
          className="flex-grow inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:bg-indigo-900/50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader />
              {fileName?.match(/\.(mp3|wav|m4a)$/i) ? 'Transcribing...' : 'Generating...'}
            </>
          ) : (
            'Generate Analysis'
          )}
        </button>
        <button
            onClick={onReset}
            disabled={isLoading}
            className="flex-shrink-0 px-6 py-3 border border-slate-600 text-base font-medium rounded-md text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 disabled:opacity-50 transition-colors duration-200"
        >
            Reset
        </button>
      </div>
    </div>
  );
};
