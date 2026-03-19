import { TestBed } from '@angular/core/testing';

import { Athletes } from './athletes';
import { MOCK_ATHLETES } from '@gymnastics-manager/shared-util';

describe('Athletes', () => {
  let service: Athletes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Athletes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all athletes by default', (done) => {
    service.allAthletes$.subscribe((athletes) => {
      expect(athletes.length).toBe(MOCK_ATHLETES.length);
      // done();
    });
  });
  it('should add a new athlete', (done) => {
    const newAthlete = {
      id: 'a99',
      firstName: 'Test',
      lastName: 'Athlete',
      country: 'CMR',
      category: 'junior' as const,
      gender: 'male' as const,
      dateOfBirth: '2005-01-01',
    };

    service.addAthlete(newAthlete);

    service.allAthletes$.subscribe((athletes) => {
      expect(athletes.find((a) => a.id === 'a99')).toBeTruthy();
      // done();
    });
  });
});
