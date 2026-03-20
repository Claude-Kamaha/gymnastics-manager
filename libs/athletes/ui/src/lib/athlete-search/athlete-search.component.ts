// libs/athletes/ui/src/lib/athlete-search/athlete-search.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-gym-athlete-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './athlete-search.component.html',
  styleUrls: ['./athlete-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AthleteSearchComponent {
  @Input() placeholder = 'Search athletes...';
  @Input() value = '';

  @Output() searched = new EventEmitter<string>();

  onInput(term: string): void {
    this.searched.emit(term);
  }

  onClear(): void {
    this.value = '';
    this.searched.emit('');
  }
}