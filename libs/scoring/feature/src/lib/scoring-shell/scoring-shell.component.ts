// libs/scoring/feature/src/lib/scoring-shell/scoring-shell.component.ts

import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Subject, take, takeUntil } from 'rxjs';

import {
  ScoreService,
  ScoreSubmission,
} from '@gymnastics-manager/scoring-data-access';
import { AthleteService } from '@gymnastics-manager/athletes-data-access';
import { ScoreSubmitFormComponent } from '../score-submit-form/score-submit-form.component';
import { ScoreLeaderboardComponent } from '../score-leaderboard/score-leaderboard.component';
import { ScoreFeedComponent } from '../score-feed/score-feed.component';
import {
  MOCK_ATHLETES,
  ScoreBridgeService,
} from '@gymnastics-manager/shared-util';

@Component({
  selector: 'lib-gym-scoring-shell',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    ScoreSubmitFormComponent,
    ScoreLeaderboardComponent,
    ScoreFeedComponent,
  ],
  templateUrl: './scoring-shell.component.html',
  styleUrls: ['./scoring-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoringShellComponent implements OnInit, OnDestroy {
  private scoreService = inject(ScoreService);
  private athleteService = inject(AthleteService);
  private bridgeService = inject(ScoreBridgeService); // ← inject bridge

  private destroy$ = new Subject<void>();

  // ─── Signals ─────────────────────────────────────────────────────────
  isLive = signal(false);
  isSubmitting = signal(false);

  // ─── Streams ──────────────────────────────────────────────────────────
  athletes$ = this.athleteService.allAthletes$;
  leaderboard$ = this.scoreService.leaderboard$;
  scoreFeed$ = this.scoreService.scoreFeed$;

  // ─── Lifecycle ────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Feed athletes into score service
    // this.athleteService.allAthletes$
    //  .pipe(take(1))
    //   .subscribe((athletes) => this.scoreService.setAthletes(athletes));

    // Keep athletes in sync when list changes
    this.athleteService.allAthletes$
      .pipe(takeUntil(this.destroy$))
      .subscribe((athletes) => this.scoreService.setAthletes(athletes));

    // Subscribe to live stream to keep it active
    this.scoreService.liveStream$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.scoreService.stopLiveStream();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Actions ──────────────────────────────────────────────────────────
  async onSeedAthletes(): Promise<void> {
    console.log('🌱 Seeding athletes...');
    await this.bridgeService.seedAthletes(MOCK_ATHLETES);
    console.log('✅ Seeding complete');
  }
  onScoreSubmitted(submission: ScoreSubmission): void {
    this.isSubmitting.set(true);
    this.scoreService.submitScore(submission);
    setTimeout(() => this.isSubmitting.set(false), 500);
  }

  onToggleLive(): void {
    this.isLive.update((live) => !live);
    this.isLive()
      ? this.scoreService.startLiveStream()
      : this.scoreService.stopLiveStream();
  }

  onResetScores(): void {
    this.scoreService.resetScores();
  }
}
