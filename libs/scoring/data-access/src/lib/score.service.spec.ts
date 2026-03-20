// libs/scoring/data-access/src/lib/score.service.spec.ts

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ScoreService } from './score.service';
import { MOCK_ATHLETES } from '@gymnastics-manager/shared-util';

describe('ScoreService', () => {
    let service: ScoreService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ScoreService);
        service.setAthletes(MOCK_ATHLETES);
    });

    afterEach(() => {
        service.stopLiveStream();
        service.resetScores();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should start with empty scores', (done) => {
        service.allScores$.subscribe((scores) => {
            expect(scores.length).toBe(0);
        });
    });

    it('should submit a score manually', (done) => {
        service.submitScore({
            athleteId: 'a1',
            competitionId: 'comp-1',
            value: 9.5,
            type: 'execution',
            judgeId: 'judge-1',
        });

        service.allScores$.subscribe((scores) => {
            expect(scores.length).toBe(1);
            expect(scores[0].value).toBe(9.5);
        });
    });

    it('should update leaderboard when score is submitted', (done) => {
        service.submitScore({
            athleteId: 'a1',
            competitionId: 'comp-1',
            value: 9.2,
            type: 'execution',
            judgeId: 'judge-1',
        });

        service.leaderboard$.subscribe((entries) => {
            const entry = entries.find((e) => e.athlete.id === 'a1');
            expect(entry?.average).toBe(9.2);

        });
    });

    it('should emit live scores from the stream', fakeAsync(() => {
        const received: any[] = [];

        service.liveStream$.subscribe((score) => received.push(score));
        service.startLiveStream();

        tick(9000); // 3 intervals of 3000ms

        expect(received.length).toBeGreaterThanOrEqual(1);
        service.stopLiveStream();
    }));

    it('should reset all scores', (done) => {
        service.submitScore({
            athleteId: 'a1',
            competitionId: 'comp-1',
            value: 8.9,
            type: 'difficulty',
            judgeId: 'judge-1',
        });

        service.resetScores();

        service.allScores$.subscribe((scores) => {
            expect(scores.length).toBe(0);
        });
    });
});