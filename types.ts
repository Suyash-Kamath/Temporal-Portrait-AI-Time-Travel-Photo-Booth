
export enum AppStep {
  LANDING = 'LANDING',
  CAPTURE = 'CAPTURE',
  ANALYSIS = 'ANALYSIS',
  ERA_SELECTION = 'ERA_SELECTION',
  RESULT = 'RESULT'
}

export interface HistoricalEra {
  id: string;
  name: string;
  description: string;
  prompt: string;
  thumbnail: string;
}

export interface ImageAnalysis {
  description: string;
  suggestedEra: string;
  visualTraits: string[];
}

export interface TemporalResult {
  imageUrl: string;
  era: HistoricalEra;
  originalImage: string;
}
