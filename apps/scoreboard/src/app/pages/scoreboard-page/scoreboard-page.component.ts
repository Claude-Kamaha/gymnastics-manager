// apps/scoreboard/src/app/pages/scoreboard-page/scoreboard-page.component.ts

import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import {
  ScoreBridgeService,
  CompetitionInfo,
  Athlete,
  Score,
  calcAverageScore,
} from '@gymnastics-manager/shared-util';

export interface LeaderboardEntry {
  rank: number;
  athlete: Athlete;
  scores: Score[];
  average: number;
  execution: number | null;
  difficulty: number | null;
  artistry: number | null;
}

@Component({
  selector: 'gym-scoreboard-page',
  standalone: true,
  imports: [CommonModule, AsyncPipe, DatePipe],
  templateUrl: './scoreboard-page.component.html',
  styleUrls: ['./scoreboard-page.component.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreboardPageComponent implements OnInit, OnDestroy {
  private bridge = inject(ScoreBridgeService);
  private destroy$ = new Subject<void>();

  // ─── Signals ─────────────────────────────────────────────────────────
  selectedAthlete = signal<Athlete | null>(null);
  currentTime = signal<Date>(new Date());

  // ─── Streams ──────────────────────────────────────────────────────────
  competition$ = this.bridge.competition$;
    athletes$ = this.bridge.athletes$;


  leaderboard$ = combineLatest([
    this.bridge.athletes$,
    this.bridge.scores$,
  ]).pipe(
    tap(([athletes, scores]) =>
      console.log('📊 Leaderboard recalculating:', athletes.length, scores.length)
    ),
    map(([athletes, scores]) =>
      athletes
        .map((athlete, index) => {
          const athleteScores = scores.filter(
            (s) => s.athleteId === athlete.id
          );
          return {
            rank: index + 1,
            athlete,
            scores: athleteScores,
            average: calcAverageScore(athleteScores),
            execution: athleteScores.find((s) => s.type === 'execution')?.value ?? null,
            difficulty: athleteScores.find((s) => s.type === 'difficulty')?.value ?? null,
            artistry: athleteScores.find((s) => s.type === 'artistry')?.value ?? null,
          };
        })
        .sort((a, b) => b.average - a.average)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))
    )
  );

  scoreFeed$ = this.bridge.scores$.pipe(
        tap((scores) => console.log('📡 Feed updated:', scores.length)),

    map((scores) => [...scores].reverse().slice(0, 10))
  );


  // ─── Computed ────────────────────────────────────────────────────────
  hasSelectedAthlete = computed(() => this.selectedAthlete() !== null);

  // ─── Lifecycle ────────────────────────────────────────────────────────

  ngOnInit(): void {
     
    // Update clock every second
    setInterval(() => this.currentTime.set(new Date()), 1000);

      // Force subscription to keep streams alive
    this.bridge.scores$
      .pipe(
        takeUntil(this.destroy$),
        tap((scores) => console.log('💾 Raw scores in scoreboard:', scores))
      )
      .subscribe();

    this.bridge.athletes$
      .pipe(takeUntil(this.destroy$))
      .subscribe((athletes) =>
        console.log('👤 Raw athletes in scoreboard:', athletes)
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Actions ──────────────────────────────────────────────────────────

  onSelectAthlete(athlete: Athlete): void {
    this.selectedAthlete.set(
      this.selectedAthlete()?.id === athlete.id ? null : athlete
    );
  }

  getAthleteScores(
    athleteId: string,
    scores: Score[]
  ): Score[] {
    return scores.filter((s) => s.athleteId === athleteId);
  }

  getRankMedal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  }

  getAthleteName(athleteId: string, athletes: Athlete[]): string {
    const athlete = athletes.find((a) => a.id === athleteId);
    return athlete ? `${athlete.firstName} ${athlete.lastName}` : 'Unknown';
  }
}