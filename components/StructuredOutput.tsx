
import React from 'react';
import { type AnalysisOutput, type ActionItem, type Risk, type Decision } from '../types';

// Helper components for styling
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-indigo-400 border-b border-slate-700 pb-2 mb-3">{title}</h3>
    {children}
  </div>
);

const Pill: React.FC<{ text: string; color: string; }> = ({ text, color }) => (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>
        {text}
    </span>
);

const getPriorityColor = (priority: ActionItem['priority']) => {
    switch (priority) {
        case 'High': return 'bg-red-500/20 text-red-300';
        case 'Medium': return 'bg-yellow-500/20 text-yellow-300';
        case 'Low': return 'bg-sky-500/20 text-sky-300';
        default: return 'bg-slate-600 text-slate-300';
    }
};

const getStatusColor = (status: ActionItem['status']) => {
    switch (status) {
        case 'Open': return 'bg-green-500/20 text-green-300';
        case 'In-progress': return 'bg-blue-500/20 text-blue-300';
        case 'Blocked': return 'bg-orange-500/20 text-orange-300';
        default: return 'bg-slate-600 text-slate-300';
    }
};

const getLikelihoodImpactColor = (level: Risk['likelihood'] | Risk['impact']) => {
    switch(level) {
        case 'High': return 'text-red-400';
        case 'Med': return 'text-yellow-400';
        case 'Low': return 'text-green-400';
        default: return 'text-slate-400';
    }
}

// Cards for individual items
const ActionItemCard: React.FC<{ item: ActionItem }> = ({ item }) => (
    <div className="bg-slate-800 p-3 rounded-md border border-slate-700 mb-2">
        <p className="text-slate-200">{item.task}</p>
        <div className="flex items-center justify-between text-sm text-slate-400 mt-2 flex-wrap gap-2">
            <span>Owner: <span className="font-medium text-slate-300">{item.owner || 'Unassigned'}</span></span>
            <div className="flex items-center gap-2">
                <Pill text={item.priority} color={getPriorityColor(item.priority)} />
                <Pill text={item.status} color={getStatusColor(item.status)} />
                {item.due && <span className="text-xs">Due: {item.due}</span>}
            </div>
        </div>
    </div>
);

const RiskCard: React.FC<{ item: Risk }> = ({ item }) => (
    <div className="bg-slate-800 p-3 rounded-md border border-slate-700 mb-2">
        <p className="text-slate-200 font-medium">{item.risk}</p>
        <div className="text-sm text-slate-400 mt-1">
          <span className="mr-4">Likelihood: <span className={getLikelihoodImpactColor(item.likelihood)}>{item.likelihood}</span></span>
          <span>Impact: <span className={getLikelihoodImpactColor(item.impact)}>{item.impact}</span></span>
        </div>
        <p className="text-xs text-slate-500 mt-2">Mitigation: {item.mitigation}</p>
    </div>
);

const DecisionCard: React.FC<{ item: Decision }> = ({ item }) => (
    <div className="bg-slate-800 p-3 rounded-md border border-slate-700 mb-2">
        <p className="text-slate-200 font-semibold">{item.decision}</p>
        <p className="text-sm text-slate-400 mt-1">Rationale: {item.rationale}</p>
    </div>
);


export const StructuredOutput: React.FC<{ result: AnalysisOutput }> = ({ result }) => {
  return (
    <div className="p-4 h-full overflow-y-auto">
        <Section title="Executive Summary">
            <p className="text-slate-300 whitespace-pre-wrap">{result.summary}</p>
        </Section>

        {result.decisions?.length > 0 && (
            <Section title="Decisions">
                {result.decisions.map((item, i) => <DecisionCard key={i} item={item} />)}
            </Section>
        )}

        {result.action_items?.length > 0 && (
            <Section title="Action Items">
                {result.action_items.map((item, i) => <ActionItemCard key={i} item={item} />)}
            </Section>
        )}

        {result.risks?.length > 0 && (
            <Section title="Risks">
                {result.risks.map((item, i) => <RiskCard key={i} item={item} />)}
            </Section>
        )}
        
        {result.follow_ups?.length > 0 && (
            <Section title="Follow-ups">
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {result.follow_ups.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </Section>
        )}

        {result.insights && (
            <Section title="Leadership Insights">
                 <div className="text-sm space-y-3 text-slate-300">
                    {result.insights.themes?.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-slate-200 mb-1">Themes</h4>
                            {result.insights.themes.map((theme, i) => <p key={i}>- <strong>{theme.name}:</strong> {theme.explanation}</p>)}
                        </div>
                    )}
                    {result.insights.missing_data?.length > 0 && (
                         <div>
                            <h4 className="font-semibold text-slate-200 mb-1">Missing Data</h4>
                            <ul className="list-disc list-inside ml-4">{result.insights.missing_data.map((item, i) => <li key={i}>{item}</li>)}</ul>
                        </div>
                    )}
                    {result.insights.suggested_questions?.length > 0 && (
                         <div>
                            <h4 className="font-semibold text-slate-200 mb-1">Suggested Questions</h4>
                            <ul className="list-disc list-inside ml-4">{result.insights.suggested_questions.map((item, i) => <li key={i}>{item}</li>)}</ul>
                        </div>
                    )}
                 </div>
            </Section>
        )}
        
        {result.tags?.length > 0 && (
            <Section title="Tags">
                <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, i) => <Pill key={i} text={tag} color="bg-gray-600/50 text-gray-300" />)}
                </div>
            </Section>
        )}
        
        <Section title="Project Brain (Context for Chat)">
            <pre className="text-xs bg-slate-900/50 p-3 rounded-md whitespace-pre-wrap font-mono">{result.project_brain}</pre>
        </Section>
    </div>
  );
};
