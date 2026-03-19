export type AthleteCategory = 'junior' | 'senior';
export type AthleteGender = 'male' | 'female';

export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  category: AthleteCategory;
  gender: AthleteGender;
  dateOfBirth: string;       
  avatarUrl?: string;
}

export function getFullname(athlete:Athlete): string {
  return `${athlete.firstName} ${athlete.lastName}`;
}