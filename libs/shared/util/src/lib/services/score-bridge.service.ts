// libs/shared/util/src/lib/services/score-bridge.service.ts

import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, interval } from 'rxjs';
import { takeUntil, distinctUntilChanged, map } from 'rxjs/operators';
import { Score } from '../models/score.model';
import { Athlete } from '../models/athlete.model';

export const SCORES_KEY = 'gym_scores';
export const ATHLETES_KEY = 'gym_athletes';
export const COMPETITION_KEY = 'gym_competition';
const POLL_INTERVAL = 1000; // poll every 1 second

export interface CompetitionInfo {
  id: string;
  name: string;
  location: string;
  date: string;
  status: 'upcoming' | 'live' | 'completed';
}

@Injectable({ providedIn: 'root' })
export class ScoreBridgeService implements OnDestroy {
  private destroy$ = new Subject<void>();

  // ─── Private state ────────────────────────────────────────────────────

  private scoresSubject$ = new BehaviorSubject<Score[]>([]);
  private athletesSubject$ = new BehaviorSubject<Athlete[]>([]);
  private competitionSubject$ = new BehaviorSubject<CompetitionInfo>({
    id: 'comp-1',
    name: 'National Gymnastics Championship 2026',
    location: 'Yaoundé, Cameroon',
    date: new Date().toISOString(),
    status: 'live',
  });

  // ─── Public streams ───────────────────────────────────────────────────

  scores$: Observable<Score[]> = this.scoresSubject$.asObservable();
  athletes$: Observable<Athlete[]> = this.athletesSubject$.asObservable();
  competition$: Observable<CompetitionInfo> =
    this.competitionSubject$.asObservable();

  constructor() {
    // Load immediately on startup
    this.syncFromStorage();

    // Poll localStorage every second for changes
    interval(POLL_INTERVAL)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.syncFromStorage());
  }

  // ─── Write actions (admin app) ────────────────────────────────────────

  publishScores(scores: Score[]): void {
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
    this.scoresSubject$.next(scores);
  }

  publishAthletes(athletes: Athlete[]): void {
    localStorage.setItem(ATHLETES_KEY, JSON.stringify(athletes));
    this.athletesSubject$.next(athletes);
  }

  publishCompetition(competition: CompetitionInfo): void {
    localStorage.setItem(COMPETITION_KEY, JSON.stringify(competition));
    this.competitionSubject$.next(competition);
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Private ──────────────────────────────────────────────────────────

  private syncFromStorage(): void {
    const scores = this.loadFromStorage<Score[]>(SCORES_KEY, []);
    const athletes = this.loadFromStorage<Athlete[]>(ATHLETES_KEY, []);
    const competition = this.loadFromStorage<CompetitionInfo>(
      COMPETITION_KEY,
      this.competitionSubject$.getValue()
    );

    // Only emit if data actually changed — avoids unnecessary re-renders
    const scoresChanged =
      JSON.stringify(scores) !==
      JSON.stringify(this.scoresSubject$.getValue());

    const athletesChanged =
      JSON.stringify(athletes) !==
      JSON.stringify(this.athletesSubject$.getValue());

    if (scoresChanged) {
      console.log('🔄 Scores synced from storage:', scores.length);
      this.scoresSubject$.next(scores);
    }

    if (athletesChanged) {
      console.log('👤 Athletes synced from storage:', athletes.length);
      this.athletesSubject$.next(athletes);
    }

    this.competitionSubject$.next(competition);
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }
}