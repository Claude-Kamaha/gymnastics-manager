// libs/athletes/ui/src/lib/athlete-table/athlete-table.component.ts

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
  selector: 'lib-gym-athlete-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './athlete-table.component.html',
  styleUrls: ['./athlete-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AthleteTableComponent {
  @Input({ required: true }) athletes!: Athlete[];
  @Input() selectedAthleteId: string | null = null;

  @Output() athleteSelected = new EventEmitter<Athlete>();
  @Output() athleteRemoved = new EventEmitter<string>();

  getFullName = getFullName;
  trackById(index: number, athlete: Athlete): string {
    return athlete.id;
  }
  onSelect(athlete: Athlete): void {
    this.athleteSelected.emit(athlete);
  }

  onRemove(event: Event, id: string): void {
    event.stopPropagation();
    this.athleteRemoved.emit(id);
  }
}