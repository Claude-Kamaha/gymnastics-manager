// libs/scoring/feature/src/lib/score-submit-form/score-submit-form.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Athlete, Score } from '@gymnastics-manager/shared-util';
import { ScoreSubmission } from '@gymnastics-manager/scoring-data-access';

@Component({
  selector: 'lib-gym-score-submit-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './score-submit-form.component.html',
  styleUrls: ['./score-submit-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreSubmitFormComponent {
  @Input({ required: true }) athletes!: Athlete[];
  @Input() isSubmitting = false;

  @Output() scoreSubmitted = new EventEmitter<ScoreSubmission>();

  scoreTypes: Score['type'][] = ['execution', 'difficulty', 'artistry'];

  form = {
    athleteId: '',
    value: 0,
    type: 'execution' as Score['type'],
    competitionId: 'comp-1',
    judgeId: 'judge-1',
  };

  onSubmit(): void {
    if (!this.form.athleteId || !this.form.value) return;
    this.scoreSubmitted.emit({ ...this.form });
    this.resetForm();
  }

  private resetForm(): void {
    this.form = {
      ...this.form,
      athleteId: '',
      value: 0,
    };
  }
}