// libs/scoring/feature/src/lib/score-leaderboard/score-leaderboard.component.ts

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveScoreEntry } from '@gymnastics-manager/scoring-data-access';

@Component({
  selector: 'lib-gym-score-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score-leaderboard.component.html',
  styleUrls: ['./score-leaderboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreLeaderboardComponent {
  @Input({ required: true }) entries!: LiveScoreEntry[];
}