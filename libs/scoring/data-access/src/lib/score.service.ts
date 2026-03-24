import { Injectable, OnDestroy, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  of,
  take,
} from 'rxjs';
import {
  catchError,
  filter,
  map,
  retry,
  share,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import {
  Score,
  Athlete,
  calcAverageScore,
  ScoreBridgeService,
} from '@gymnastics-manager/shared-util';

export interface LiveScoreEntry {
  athlete: Athlete;
  scores: Score[];
  average: number;
  latest: number | null;
}

export interface ScoreSubmission {
  athleteId: string;
  competitionId: string;
  value: number;
  type: Score['type'];
  judgeId: string;
}

@Injectable({ providedIn: 'root' })
export class ScoreService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private bridgeService = inject(ScoreBridgeService);
  private athletesSource$ = new BehaviorSubject<Athlete[]>([]);
  private isLiveActive$ = new BehaviorSubject<boolean>(false);

  // ─── Public streams ───────────────────────────────────────────────────

  allScores$ = this.bridgeService.scores$;

  leaderboard$: Observable<LiveScoreEntry[]> = combineLatest([
    this.athletesSource$,
    this.bridgeService.scores$,
  ]).pipe(
    map(([athletes, scores]) =>
      athletes
        .map((athlete) => {
          const athleteScores = scores.filter(
            (s) => s.athleteId === athlete.id,
          );
          return {
            athlete,
            scores: athleteScores,
            average: calcAverageScore(athleteScores),
            latest: athleteScores.length
              ? athleteScores[athleteScores.length - 1].value
              : null,
          };
        })
        .sort((a, b) => b.average - a.average),
    ),
    catchError(() => of([])),
  );

  scoreFeed$: Observable<Score[]> = this.bridgeService.scores$.pipe(
    map((scores) => [...scores].reverse().slice(0, 10)),
  );

  liveStream$ = this.isLiveActive$.pipe(
    switchMap((isActive) => {
      if (!isActive) return of();
      return new Observable<Score>((observer) => {
        const interval = setInterval(async () => {
          const score = this.generateRandomScore();
          if (score) {
            await this.bridgeService.publishScore(score);
            observer.next(score);
          }
        }, 3000);
        return () => clearInterval(interval);
      });
    }),
    share(),
    takeUntil(this.destroy$),
  );

  // ─── Actions ──────────────────────────────────────────────────────────

  setAthletes(athletes: Athlete[]): void {
    this.athletesSource$.next(athletes);
  }

  submitScore(submission: ScoreSubmission): void {
    const score: Score = {
      id: this.generateId(),
      athleteId: submission.athleteId,
      competitionId: submission.competitionId,
      value: submission.value,
      type: submission.type,
      judgeId: submission.judgeId,
      submittedAt: new Date().toISOString(),
    };

    // Check for existing score for same athlete + type
    this.bridgeService.scores$.pipe(take(1)).subscribe(async (scores) => {
      const existing = scores.find(
        (s) =>
          s.athleteId === submission.athleteId && s.type === submission.type,
      );

      if (existing) {
        await this.bridgeService.publishScore({
          ...score,
          id: existing.id,
        });
      } else {
        await this.bridgeService.publishScore(score);
      }
    });
  }

  startLiveStream(): void {
    this.isLiveActive$.next(true);
  }

  stopLiveStream(): void {
    this.isLiveActive$.next(false);
  }

  async resetScores(): Promise<void> {
    this.bridgeService.scores$.pipe(take(1)).subscribe(async (scores) => {
      for (const score of scores) {
        await this.bridgeService.deleteScore(score.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Private helpers ──────────────────────────────────────────────────

  private generateRandomScore(): Score | null {
    const athletes = this.athletesSource$.getValue();
    if (!athletes.length) return null;

    const athlete = athletes[Math.floor(Math.random() * athletes.length)];
    const types: Score['type'][] = ['execution', 'difficulty', 'artistry'];

    return {
      id: this.generateId(),
      athleteId: athlete.id,
      competitionId: 'comp-1',
      value: parseFloat((Math.random() * 4 + 6).toFixed(2)),
      type: types[Math.floor(Math.random() * types.length)],
      judgeId: 'judge-auto',
      submittedAt: new Date().toISOString(),
    };
  }

  private generateId(): string {
    return `score-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
}
