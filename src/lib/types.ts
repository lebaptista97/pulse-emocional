// Tipos do Pulse

export type QuizAnswer = 'never' | 'sometimes' | 'often' | 'always';

export interface QuizQuestion {
  id: number;
  text: string;
  category: 'anxiety' | 'exhaustion' | 'self-criticism' | 'avoidance' | 'autopilot';
}

export interface QuizResponse {
  questionId: number;
  answer: QuizAnswer;
}

export interface QuizResult {
  patterns: string[];
  score: number;
  timestamp: Date;
}

export interface CheckInData {
  mood: number; // 0-4
  stress: number; // 0-4
  energy: number; // 0-4
  sleep: number; // 0-4
  selfCriticism: number; // 0-4
  timestamp: Date;
}

export interface EMEResult {
  score: number; // 0-10
  phrase: string;
  insight: string;
  timestamp: Date;
}

export interface RadarPattern {
  name: string;
  description: string;
  intensity: 'low' | 'medium' | 'high';
}

export interface Intervention {
  type: 'breathing' | 'writing' | 'body-awareness' | 'micro-challenge' | 'guided-pause';
  title: string;
  description: string;
  duration: number; // em minutos
  instructions: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  createdAt: Date;
  streak: number;
  lastCheckIn?: Date;
}
