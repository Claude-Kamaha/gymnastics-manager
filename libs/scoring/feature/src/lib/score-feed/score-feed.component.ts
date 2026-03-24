// libs/scoring/feature/src/lib/score-feed/score-feed.component.ts

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Score } from '@gymnastics-manager/shared-util';
import { Athlete } from '@gymnastics-manager/shared-util';

@Component({
  selector: 'lib-gym-score-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score-feed.component.html',
  styleUrls: ['./score-feed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreFeedComponent {
  @Input({ required: true }) scores!: Score[];
  @Input({ required: true }) athletes!: Athlete[];

  getAthleteName(athleteId: string): string {
    const athlete = this.athletes.find((a) => a.id === athleteId);
    return athlete
      ? `${athlete.firstName} ${athlete.lastName}`
      : 'Unknown';
  }
}