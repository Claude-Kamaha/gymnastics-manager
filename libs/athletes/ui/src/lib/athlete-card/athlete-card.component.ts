// libs/athletes/ui/src/lib/athlete-card/athlete-card.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Athlete, getFullName } from '@gymnastics-manager/shared-util';

@Component({
  selector: 'lib-gym-athlete-card',
  standalone: true,
  templateUrl: './athlete-card.component.html',
  styleUrls: ['./athlete-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AthleteCardComponent {
  @Input({ required: true }) athlete!: Athlete;
  @Input() isSelected = false;

  @Output() selected = new EventEmitter<Athlete>();

  getFullName = getFullName;
  trackById(index: number, athlete: Athlete): string {
    return athlete.id;
  }
  onSelect(): void {
    this.selected.emit(this.athlete);
  }
}