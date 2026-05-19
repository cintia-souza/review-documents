export interface ProfileScores {
  title: number;
  summary: number;
  experience: number;
  overall: number;
}

export interface ProfileFeedback {
  title: string;
  summary: string;
  experience: string;
  tips: string[];
}

export interface AnalysisResult {
  id: string;
  scores: ProfileScores;
  feedback: ProfileFeedback;
  source: "linkedin_url" | "pdf_upload";
  createdAt: string;
}

export interface AnalyzePayload {
  type: "linkedin_url" | "pdf_upload";
  linkedinUrl?: string;
  fileBase64?: string;
  fileName?: string;
}

export interface PremiumContent {
  optimizedHeadline?: string;
  aboutRewrite: string;
  experienceRewrites: string[];
  editorialCalendar: PostIdea[];
  advancedTips: AdvancedTip[];
}

export interface PostIdea {
  day: string;
  topic: string;
  hook: string;
  hashtags: string[];
}

export interface AdvancedTip {
  category: "photo" | "tone" | "hashtags" | "engagement";
  title: string;
  description: string;
}

export type UserPlan = "FREE" | "PREMIUM";
