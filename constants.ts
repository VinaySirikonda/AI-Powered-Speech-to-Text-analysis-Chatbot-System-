
import { Type } from "@google/genai";

export const SYSTEM_INSTRUCTION = `SYSTEM ROLE
You are an AI project assistant for software teams. Be factual and concise. Never invent owners, dates, or metrics. If a detail is missing, set it to null or “unknown”. Return ONLY valid JSON exactly matching the schema. No extra prose, no markdown fences.

RUN VARIABLES
project_name: AI PM MVP — File Upload v1
meeting_text: |
[PASTE THE FULL TEXT EXTRACTED FROM THE UPLOADED FILE HERE]
optional_comments: |
[PASTE OPTIONAL COMMENTS HERE OR "N/A"]

TASK
From meeting_text, produce:
- Executive summary (≤140 words).
- Structured decisions, action items, follow-ups, risks, tags.
- Leadership insights (themes, changes, assumptions to validate, missing data, suggested questions).
- A compact “project_brain” string for Q&A.
- Optional batch sentiment analysis for optional_comments.

OUTPUT FORMAT
Return ONLY a single valid JSON object with this schema:
{
"project": "string",
"summary": "string (<=140 words, stakeholder-ready, factual)",
"decisions": [
{ "decision": "string", "rationale": "string" }
],
"action_items": [
{
"owner": "string or null",
"task": "string",
"due": "YYYY-MM-DD or null",
"priority": "High|Medium|Low",
"status": "Open|In-progress|Blocked"
}
],
"follow_ups": ["string"],
"risks": [
{
"risk": "string (concrete, not generic)",
"likelihood": "Low|Med|High",
"impact": "Low|Med|High",
"mitigation": "string (one actionable step)"
}
],
"tags": ["3-6 short topical tags"],
"insights": {
"themes": [{"name":"string","explanation":"one sentence"}],
"changes": ["string"],
"assumptions_to_validate": ["string"],
"missing_data": ["string (specific owners/dates/metrics not provided)"],
"suggested_questions": ["<=6 concrete questions for next meeting"]
},
"sentiment_pass": [
{
"author": "string",
"content": "string",
"sentiment": "positive|neutral|negative",
"risk_flags": ["deadline risk","blocked","scope creep","confusion","resource gap","dependency","quality issue"],
"urgency": "Low|Medium|High",
"rationale": "one short sentence citing exact phrases"
}
],
"project_brain": "string <=1200 characters. Plain text sections labeled exactly: Summary, Decisions, ActionItems, Risks, Tags, LastUpdated. ActionItems formatted as 'owner: task (due: YYYY-MM-DD|null)'. Use today’s date in ISO for LastUpdated. Include only the most answerable facts. No fluff.",
"metadata": {
"source": "file_upload_v1",
"tokens_estimate": "auto",
"generation_notes": "brief note on any ambiguities detected"
}
}

CONSTRAINTS
- Normalize text internally (remove timestamps/boilerplate) but keep all decisions, owners, dates, and metrics.
- Do not fabricate owners or due dates; set to null if unknown.
- Clip overly long quotes; prefer concise paraphrase.
- Keep the summary ≤140 words and avoid repetition.
- Risks must include both likelihood and impact plus a one-line mitigation.
- If optional_comments is empty, return "sentiment_pass": [].
- Always return valid JSON. No extra commentary.
`;

export const CHAT_SYSTEM_INSTRUCTION = `You are an AI project assistant. Your task is to answer questions about a project based ONLY on the provided context. The context is a "project brain" string containing a summary, decisions, action items, and risks.
- Be concise and factual.
- If the answer is not found in the provided context, state that you do not have enough information to answer. Do not invent details.
- When asked about action items or risks, present them clearly.
- Your persona is helpful, professional, and to-the-point.`;


export const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    project: { type: Type.STRING },
    summary: { type: Type.STRING, description: "<=140 words, stakeholder-ready, factual" },
    decisions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          decision: { type: Type.STRING },
          rationale: { type: Type.STRING }
        },
        required: ["decision", "rationale"]
      }
    },
    action_items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          owner: { type: Type.STRING, nullable: true },
          task: { type: Type.STRING },
          due: { type: Type.STRING, nullable: true, description: "YYYY-MM-DD or null" },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          status: { type: Type.STRING, enum: ["Open", "In-progress", "Blocked"] }
        },
        required: ["owner", "task", "due", "priority", "status"]
      }
    },
    follow_ups: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          risk: { type: Type.STRING },
          likelihood: { type: Type.STRING, enum: ["Low", "Med", "High"] },
          impact: { type: Type.STRING, enum: ["Low", "Med", "High"] },
          mitigation: { type: Type.STRING }
        },
        required: ["risk", "likelihood", "impact", "mitigation"]
      }
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-6 short topical tags"
    },
    insights: {
      type: Type.OBJECT,
      properties: {
        themes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    explanation: { type: Type.STRING, description: "one sentence" }
                },
                required: ["name", "explanation"]
            }
        },
        changes: { type: Type.ARRAY, items: { type: Type.STRING } },
        assumptions_to_validate: { type: Type.ARRAY, items: { type: Type.STRING } },
        missing_data: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggested_questions: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["themes", "changes", "assumptions_to_validate", "missing_data", "suggested_questions"]
    },
    sentiment_pass: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          author: { type: Type.STRING },
          content: { type: Type.STRING },
          sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] },
          risk_flags: {
            type: Type.ARRAY,
            items: { type: Type.STRING, enum: ["deadline risk", "blocked", "scope creep", "confusion", "resource gap", "dependency", "quality issue"] }
          },
          urgency: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          rationale: { type: Type.STRING }
        },
        required: ["author", "content", "sentiment", "risk_flags", "urgency", "rationale"]
      }
    },
    project_brain: { type: Type.STRING, description: "<=1200 characters plain text" },
    metadata: {
      type: Type.OBJECT,
      properties: {
        source: { type: Type.STRING },
        tokens_estimate: { type: Type.STRING },
        generation_notes: { type: Type.STRING }
      },
      required: ["source", "tokens_estimate", "generation_notes"]
    }
  },
  required: ["project", "summary", "decisions", "action_items", "follow_ups", "risks", "tags", "insights", "sentiment_pass", "project_brain", "metadata"]
};


export const MOCK_INPUT = {
    projectName: "QuantumLeap AI - v2 Strategy Session",
    meetingText: ``, 
    optionalComments: `Priya: The user auth flow feels clunky. We need UX feedback before the next sprint.
Raj: I'm concerned about the database scaling for the new analytics feature. We might need to look at read replicas.
Anika: Blocked on the final designs for the dashboard. Can we get an ETA from the design team?
Vikram: The new deployment pipeline is working smoothly! Cut deployment time by 40%.`
};