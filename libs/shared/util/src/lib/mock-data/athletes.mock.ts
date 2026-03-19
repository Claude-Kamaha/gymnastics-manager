// libs/shared/util/src/lib/mock-data/athletes.mock.ts
import { Athlete } from '../models/athlete.model';

export const MOCK_ATHLETES: Athlete[] = [
  {
    id: 'a1',
    firstName: 'Simone',
    lastName: 'Biles',
    country: 'USA',
    category: 'senior',
    gender: 'female',
    dateOfBirth: '1997-03-14',
  },
  {
    id: 'a2',
    firstName: 'Carlos',
    lastName: 'Yulo',
    country: 'PHI',
    category: 'senior',
    gender: 'male',
    dateOfBirth: '2000-02-17',
  },
  {
    id: 'a3',
    firstName: 'Rebeca',
    lastName: 'Andrade',
    country: 'BRA',
    category: 'senior',
    gender: 'female',
    dateOfBirth: '1999-05-08',
  },
  {
    id: 'a4',
    firstName: 'Jake',
    lastName: 'Jarman',
    country: 'GBR',
    category: 'junior',
    gender: 'male',
    dateOfBirth: '2003-09-21',
  },
  {
    id: 'a5',
    firstName: 'Ana',
    lastName: 'Barbosu',
    country: 'ROU',
    category: 'junior',
    gender: 'female',
    dateOfBirth: '2004-06-10',
  },
];