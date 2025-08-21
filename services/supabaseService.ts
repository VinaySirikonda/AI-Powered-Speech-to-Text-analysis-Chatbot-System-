import { createClient } from '@supabase/supabase-js';
import { type AnalysisOutput, type ChatMessage } from '../types';

/**
 * --- Supabase Integration Guide ---
 *
 * This service is now connected to your Supabase project.
 * Ensure you have created the 'analyses' and 'chat_messages' tables
 * with the correct columns and policies.
 */

// Add the standard Supabase `Json` type to handle `jsonb` columns.
// This ensures that the `full_output` field is correctly typed for the client.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];


// Define the database schema types to provide type safety for the Supabase client.
// This resolves the TypeScript errors by informing the client about the
// available tables, columns, and their types.
type Database = {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string;
          created_at: string;
          project_name: string;
          summary: string;
          full_output: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          project_name: string;
          summary: string;
          full_output: Json;
        };
        Update: {
          project_name?: string;
          summary?: string;
          full_output?: Json;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: number;
          created_at: string;
          analysis_id: string;
          role: 'user' | 'model';
          content: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          analysis_id: string;
          role: 'user' | 'model';
          content: string;
        };
        Update: {
          role?: 'user' | 'model';
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_messages_analysis_id_fkey',
            columns: ['analysis_id'],
            isOneToOne: false,
            referencedRelation: 'analyses',
            referencedColumns: ['id'],
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Prioritize environment variables, but fall back to the provided keys.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xcsnadjzokhjpgnyejzv.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjc25hZGp6b2toanBnbnllanp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3Njk1NDQsImV4cCI6MjA3MTM0NTU0NH0.WfG9X0CW4K_kYGn8fpt7hUMHrM_vIfcOtEJTWzURSDg';


if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Key are not configured. Please check environment variables or hardcoded values.");
}


// Provide the Database type to the createClient function for type safety.
const supabase = createClient<Database>(supabaseUrl, supabaseKey);


// Saves the initial analysis and the first "greeting" message from the model.
export const saveAnalysisAndFirstMessage = async (
    analysis: AnalysisOutput,
    firstMessage: ChatMessage
): Promise<{analysisId: string}> => {
    try {
        // Insert into 'analyses' table
        const { data, error } = await supabase
            .from('analyses')
            .insert({
                project_name: analysis.project,
                summary: analysis.summary,
                full_output: analysis as unknown as Json // Store the whole JSON object
            })
            .select('id')
            .single();
        
        if (error) throw error;
        if (!data) throw new Error("Insert operation did not return the expected data. This might be due to RLS policies.");

        const analysisId = data.id;

        // Insert the first chat message linked to this analysis
        await saveChatMessage(analysisId, firstMessage);

        console.log(`Supabase: Saved analysis with ID: ${analysisId}`);
        return { analysisId };
    } catch (error: any) {
        let userMessage = "Error saving analysis to Supabase. This is often due to a missing table or incorrect Row Level Security (RLS) policies.";

        // Check for common, specific Supabase errors
        if (error.message) {
            if (error.message.includes("violates row-level security policy")) {
                userMessage = `A security policy is preventing data from being saved. Please run the setup script from the guide in your Supabase SQL Editor to create the correct policies.`;
            } else if (error.code === '42P01') { // '42P01' is undefined_table
                userMessage = `Database table not found. Please run the setup script from the guide in your Supabase SQL Editor to create the 'analyses' and 'chat_messages' tables.`;
            }
        }
        
        console.error("Supabase Error:", error);
        throw new Error(userMessage);
    }
};

// Saves a single chat message.
export const saveChatMessage = async (analysisId: string, message: ChatMessage): Promise<void> => {
    try {
        const { error } = await supabase.from('chat_messages').insert({
            analysis_id: analysisId,
            role: message.role,
            content: message.content,
        });
        if (error) throw error;
        console.log(`Supabase: Saved message for analysis ID: ${analysisId}`);
    } catch (error: any) {
        // Log this error but don't throw a user-facing error to avoid interrupting the chat flow.
        console.error("Error saving chat message to Supabase:", error.message || "No message provided.");
    }
};