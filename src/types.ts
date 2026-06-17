export interface Persona {
  id: string;
  name: string;
  title: string;
  segment: string;
  painPoint: string;
  goal: string;
  prompt: string;
}

export interface Citation {
  title: string;
  url: string;
}

export type ScoreLevel = 'HIGH' | 'MEDIUM' | 'NONE';

export interface EngineResult {
  answerText: string;
  citations: Citation[];
  mentionScore: ScoreLevel;
  mentionPlacementReason: string;
  mentionPoints: number;
  citationScore: ScoreLevel;
  citationPlacementReason: string;
  citationPoints: number;
}

export interface EEATRemediation {
  suggestedTitle: string;
  formatType: string;
  experienceSection: string;
  expertiseSection: string;
  authoritySection: string;
  trustSection: string;
  readyToUseCopySnippet: string;
}

export interface PromptAuditResult {
  personaId: string;
  personaName: string;
  personaTitle: string;
  prompt: string;
  gemini: EngineResult;
  chatgpt: EngineResult;
  eeatContent?: EEATRemediation;
}

export interface AuditReport {
  id: string;
  targetUrl: string;
  brandName: string;
  extractedCategory: string;
  extractedICP: string;
  extractedOfferings: string[];
  personas: Persona[];
  audits: PromptAuditResult[];
  overallVisibilityScore: number;
  geminiVisibilityScore: number;
  chatgptVisibilityScore: number;
  createdAt: string;
}
