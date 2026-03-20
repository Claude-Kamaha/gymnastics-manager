// libs/athletes/feature/src/lib/athlete-list/athlete-list.component.ts

import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { AthleteService } from '@gymnastics-manager/athletes-data-access';
import { AthleteCardComponent } from '@gymnastics-manager/athletes-ui';
import { AthleteTableComponent } from '@gymnastics-manager/athletes-ui';
import { AthleteSearchComponent } from '@gymnastics-manager/athletes-ui';
import { Athlete } from '@gymnastics-manager/shared-util';

type ViewMode = 'card' | 'table';

@Component({
  selector: 'lib-gym-athlete-list',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    AthleteCardComponent,
    AthleteTableComponent,
    AthleteSearchComponent,
  ],
  templateUrl: './athlete-list.component.html',
  styleUrls: ['./athlete-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AthleteListComponent implements OnInit, OnDestroy {
  private athleteService = inject(AthleteService);
  private destroy$ = new Subject<void>();

  // ─── Signals ────────────────────────────────────────────────────────

  /** Currently selected athlete */
  selectedAthlete = signal<Athlete | null>(null);

  /** Toggle between card grid and table view */
  viewMode = signal<ViewMode>('card');

  /** Current search term */
  searchTerm = signal<string>('');

  /** Computed — label for view toggle button */
  viewModeLabel = computed(() =>
    this.viewMode() === 'card' ? 'Switch to Table' : 'Switch to Cards'
  );

  /** Computed — is an athlete currently selected */
  hasSelection = computed(() => this.selectedAthlete() !== null);

  // ─── RxJS streams (from service) ────────────────────────────────────

  athletes$ = this.athleteService.filteredAthletes$;

  // ─── Lifecycle ───────────────────────────────────────────────────────

  ngOnInit(): void {
    // Sync selected athlete from service stream into signal
    this.athleteService.selectedAthlete$
      .pipe(takeUntil(this.destroy$))
      .subscribe((athlete) => this.selectedAthlete.set(athlete));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Event handlers ──────────────────────────────────────────────────

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.athleteService.search(term);
  }

  onAthleteSelected(athlete: Athlete): void {
    this.athleteService.selectAthlete(athlete.id);
  }

  onAthleteRemoved(id: string): void {
    this.athleteService.removeAthlete(id);
    // Clear selection if removed athlete was selected
    if (this.selectedAthlete()?.id === id) {
      this.athleteService.selectAthlete(null);
    }
  }

  onToggleViewMode(): void {
    this.viewMode.update((mode) => (mode === 'card' ? 'table' : 'card'));
  }

  onClearSelection(): void {
    this.athleteService.selectAthlete(null);
  }
}