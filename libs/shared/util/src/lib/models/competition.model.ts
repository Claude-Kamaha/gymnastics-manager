export type CompetitionStatus = 'upcoming' | 'live' | 'completed';
export interface Competition {
  id: string;
  name: string;
  location: string;
  date: string;              // ISO string
  status: CompetitionStatus;
  athleteIds: string[];      // references to Athlete.id
}
