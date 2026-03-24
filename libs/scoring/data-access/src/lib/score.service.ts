// libs/scoring/data-access/src/lib/score.service.ts

import { inject, Injectable, OnDestroy } from '@angular/core';
import {
    BehaviorSubject,
    Observable,
    Subject,
    combineLatest,
    interval,
    of,
} from 'rxjs';
import {
    catchError,
    filter,
    map,
    retry,
    scan,
    share,
    startWith,
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
    // ─── Private state streams ────────────────────────────────────────────

    /** All submitted scores */
    private scoresSource$ = new BehaviorSubject<Score[]>([]);

    /** Controls whether the live simulation is running */
    private isLiveActive$ = new BehaviorSubject<boolean>(false);

    /** Athlete list injected externally via setAthletes() */
    private athletesSource$ = new BehaviorSubject<Athlete[]>([]);

    // ─── Public streams ───────────────────────────────────────────────────

    /** All scores as read-only stream */
    allScores$: Observable<Score[]> = this.scoresSource$.asObservable();

  constructor() {
      console.log('🔧 ScoreService initialized'); // ← add this

    // Publish scores to bridge whenever they change
   this.scoresSource$
    .pipe(takeUntil(this.destroy$))
    .subscribe((scores) => {
      console.log('🔄 Scores changed, publishing:', scores); // ← add this
      this.bridgeService.publishScores(scores);
    });
  }

    /**
     * Live score simulation — emits a random score every 3 seconds
     * Only runs when startLiveStream() is called
     */
    liveStream$: Observable<Score> = this.isLiveActive$.pipe(
        switchMap((isActive) => {
            if (!isActive) return of();  // pause stream when inactive

            return interval(3000).pipe(
                map(() => this.generateRandomScore()),
                filter((score): score is Score => score !== null),
                tap((score) => this.addScoreToSource(score)),
                catchError(() => of()),
                retry(3)
            );
        }),
        share(), // multicasts to all subscribers
        takeUntil(this.destroy$)
    );


    /**
     * Leaderboard — combines athletes + scores into ranked entries
     * Auto-updates whenever either stream changes
     */
    leaderboard$: Observable<LiveScoreEntry[]> = combineLatest([
        this.athletesSource$.pipe(startWith([])),
        this.scoresSource$.pipe(startWith([])),
    ]).pipe(
        map(([athletes, scores]) =>
            athletes
                .map((athlete) => {
                    const athleteScores = scores.filter(
                        (s) => s.athleteId === athlete.id
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
                .sort((a, b) => b.average - a.average) // highest average first
        ),
        catchError(() => of([])),
        retry(2)
    );

    /**
     * Score feed — running list of last 10 score events
     * Uses scan() to accumulate entries like a log
     */
    scoreFeed$: Observable<Score[]> = this.scoresSource$.pipe(
        scan((acc, scores) => scores.slice(-10), [] as Score[]),
        startWith([])
    );

    // ─── Actions ──────────────────────────────────────────────────────────

    /** Feed athletes into the service from outside */
    setAthletes(athletes: Athlete[]): void {
        this.athletesSource$.next(athletes);
        this.bridgeService.publishAthletes(athletes); // ← add this

    }

    /** Manually submit a score (from the judge form) */
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
        this.addScoreToSource(score);
    }

    /** Start the live score simulation */
    startLiveStream(): void {
        this.isLiveActive$.next(true);
    }

    /** Pause the live score simulation */
    stopLiveStream(): void {
        this.isLiveActive$.next(false);
    }

    /** Clear all scores */
    resetScores(): void {
        this.scoresSource$.next([]);
    }

    // ─── Lifecycle ────────────────────────────────────────────────────────

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ─── Private helpers ──────────────────────────────────────────────────

    private addScoreToSource(score: Score): void {
        // const current = this.scoresSource$.getValue();
        // this.scoresSource$.next([...current, score]);
          const current = this.scoresSource$.getValue();

  // Check if a score already exists for this athlete + type combination
  const existingIndex = current.findIndex(
    (s) =>
      s.athleteId === score.athleteId &&
      s.type === score.type
  );

  if (existingIndex !== -1) {
    // ✅ Update existing score instead of adding a new one
    const updated = [...current];
    updated[existingIndex] = score;
    this.scoresSource$.next(updated);
  } else {
    // ✅ No score yet for this type — add it
    this.scoresSource$.next([...current, score]);
  }

    }

    private generateRandomScore(): Score | null {
        const athletes = this.athletesSource$.getValue();
        if (!athletes.length) return null;

        const athlete = athletes[Math.floor(Math.random() * athletes.length)];
        const types: Score['type'][] = ['execution', 'difficulty', 'artistry'];

        return {
            id: this.generateId(),
            athleteId: athlete.id,
            competitionId: 'comp-1',
            value: parseFloat((Math.random() * 4 + 6).toFixed(2)), // 6.00 - 10.00
            type: types[Math.floor(Math.random() * types.length)],
            judgeId: 'judge-auto',
            submittedAt: new Date().toISOString(),
        };
    }

    private generateId(): string {
        return `score-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    }
}