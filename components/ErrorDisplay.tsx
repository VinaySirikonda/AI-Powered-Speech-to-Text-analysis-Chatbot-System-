
import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg h-full flex flex-col justify-center items-center text-center">
      <div className="flex items-center mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-semibold text-lg text-red-200">An Error Occurred</h3>
      </div>
      <p className="text-sm">{message}</p>
      <p className="text-xs mt-2 text-red-400">If you are running this locally, please ensure your API_KEY is correctly configured in your environment variables.</p>
    </div>
  );
};
