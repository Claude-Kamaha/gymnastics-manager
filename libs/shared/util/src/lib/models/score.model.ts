
export type ScoreType = 'execution' | 'difficulty' | 'artistry';

export interface Score {
  id: string;
  athleteId: string;         // references Athlete.id
  competitionId: string;     // references Competition.id
  value: number;             // e.g. 9.6
  type: ScoreType;
  submittedAt: string;       // ISO string timestamp
  judgeId: string;
}

export function calcAverageScore(scores: Score[]): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, score) => sum + score.value, 0);
  return parseFloat((total / scores.length).toFixed(3));
}