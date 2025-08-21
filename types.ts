
export interface Decision {
  decision: string;
  rationale: string;
}

export interface ActionItem {
  owner: string | null;
  task: string;
  due: string | null;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In-progress' | 'Blocked';
}

export interface Risk {
  risk: string;
  likelihood: 'Low' | 'Med' | 'High';
  impact: 'Low' | 'Med' | 'High';
  mitigation: string;
}

export interface Theme {
    name: string;
    explanation: string;
}

export interface Insights {
  themes: Theme[];
  changes: string[];
  assumptions_to_validate: string[];
  missing_data: string[];
  suggested_questions: string[];
}

export interface Sentiment {
  author: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  risk_flags: string[];
  urgency: 'Low' | 'Medium' | 'High';
  rationale: string;
}

export interface Metadata {
  source: string;
  tokens_estimate: number | string;
  generation_notes: string;
}

export interface AnalysisOutput {
  project: string;
  summary: string;
  decisions: Decision[];
  action_items: ActionItem[];
  follow_ups: string[];
  risks: Risk[];
  tags: string[];
  insights: Insights;
  sentiment_pass: Sentiment[];
  project_brain: string;
  metadata: Metadata;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
