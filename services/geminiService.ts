
import { GoogleGenAI, Chat } from "@google/genai";
import { type AnalysisOutput, type ChatMessage } from '../types';
import { SYSTEM_INSTRUCTION, RESPONSE_SCHEMA, CHAT_SYSTEM_INSTRUCTION } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateProjectAnalysis(
  projectName: string,
  meetingText: string,
  optionalComments: string
): Promise<AnalysisOutput> {
  const model = 'gemini-2.5-flash';
  
  // The new prompt structure is simpler and directly embedded in the system instruction.
  // We just need to provide the variables.
  const userPrompt = `
    RUN VARIABLES
    project_name: ${projectName}
    meeting_text: |
    ${meetingText}
    optional_comments: |
    ${optionalComments || "N/A"}
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.1, // Lower temperature for more deterministic, factual output
      },
    });

    const jsonString = response.text;
    
    if (!jsonString) {
        throw new Error("API returned an empty response.");
    }

    // The response is expected to be a valid JSON string due to responseMimeType and responseSchema.
    const parsedJson: AnalysisOutput = JSON.parse(jsonString);
    return parsedJson;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("The provided API key is not valid. Please check your .env configuration.");
    }
    throw new Error(`Failed to generate project analysis. ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function startChat(projectBrain: string): { chat: Chat; initialHistory: ChatMessage[] } {
  const initialHistory: ChatMessage[] = [
    {
      role: 'user',
      content: `Here is the project context. Use it to answer all my questions:\n\n---\n${projectBrain}\n---`
    },
    {
      role: 'model',
      content: "I've analyzed the document. What would you like to know?"
    }
  ];

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: initialHistory, // Use history to provide context
    config: {
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      temperature: 0.2,
    },
  });
  return { chat, initialHistory };
}