import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  map,
} from 'rxjs/operators';
import { Athlete, ScoreBridgeService } from '@gymnastics-manager/shared-util';

@Injectable({ providedIn: 'root' })
export class AthleteService {
  private bridgeService = inject(ScoreBridgeService);
  private searchTerm$ = new BehaviorSubject<string>('');
  private selectedAthleteId$ = new BehaviorSubject<string | null>(null);

  // ─── Streams from Firestore ───────────────────────────────────────────

  allAthletes$ = this.bridgeService.athletes$;

  filteredAthletes$: Observable<Athlete[]> = combineLatest([
    this.bridgeService.athletes$,
    this.searchTerm$.pipe(debounceTime(300), distinctUntilChanged()),
  ]).pipe(
    switchMap(([athletes, term]) => this.filterAthletes(athletes, term)),
    catchError(() => of([])),
  );

  selectedAthlete$: Observable<Athlete | null> = combineLatest([
    this.bridgeService.athletes$,
    this.selectedAthleteId$,
  ]).pipe(
    map(([athletes, id]) =>
      id ? (athletes.find((a) => a.id === id) ?? null) : null,
    ),
  );

  // ─── Actions ──────────────────────────────────────────────────────────

  search(term: string): void {
    this.searchTerm$.next(term);
  }

  selectAthlete(id: string | null): void {
    this.selectedAthleteId$.next(id);
  }

  async addAthlete(athlete: Athlete): Promise<void> {
    await this.bridgeService.publishAthlete(athlete);
  }

  async updateAthlete(athlete: Athlete): Promise<void> {
    await this.bridgeService.publishAthlete(athlete);
  }

  async removeAthlete(id: string): Promise<void> {
    await this.bridgeService.deleteAthlete(id);
  }

  // ─── Private ──────────────────────────────────────────────────────────

  private filterAthletes(
    athletes: Athlete[],
    term: string,
  ): Observable<Athlete[]> {
    if (!term.trim()) return of(athletes);
    const lower = term.toLowerCase();
    return of(
      athletes.filter(
        (a) =>
          a.firstName.toLowerCase().includes(lower) ||
          a.lastName.toLowerCase().includes(lower) ||
          a.country.toLowerCase().includes(lower) ||
          a.category.toLowerCase().includes(lower),
      ),
    );
  }
}
