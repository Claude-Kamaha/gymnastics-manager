import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, debounce, debounceTime, distinctUntilChanged, Observable, of, retry, switchMap } from 'rxjs';
import { Athlete, MOCK_ATHLETES } from '@gymnastics-manager/shared-util';
@Injectable({
  providedIn: 'root',
})
export class Athletes {
  
  private athletesSource$ = new BehaviorSubject<Athlete[]>(MOCK_ATHLETES);
  private searchTerm$ = new BehaviorSubject<string>('');
  
  allAthletes$ = this.athletesSource$.asObservable()
  filteredAthletes$: Observable<Athlete[]> = combineLatest([
    this.athletesSource$,
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ),
  ]).pipe(
    switchMap(([athletes, term]) =>
      this.filterAthletes(athletes, term)
    ),
    catchError(() => of([])),
    retry(2)
  );

seaarch(term: string) {
    this.searchTerm$.next(term);
  }

  addAthlete(athlete: Athlete) {
    const currentAthletes = this.athletesSource$.value;
    this.athletesSource$.next([...currentAthletes, athlete]);
  }

  updateAthlete(updated: Athlete) {
    const current = this.athletesSource$.getValue();
    this.athletesSource$.next(current.map((athlete)=>athlete.id===updated.id?updated:athlete));

    }

    removeAthlete(id:string){
      const current = this.athletesSource$.getValue();
      this.athletesSource$.next(current.filter(athlete=>athlete.id!==id))
    }

    
    private filterAthletes(
    athletes: Athlete[],
    term: string
  ): Observable<Athlete[]> {
    if (!term.trim()) return of(athletes);

    const lower = term.toLowerCase();
    return of(
      athletes.filter(
        (a) =>
          a.firstName.toLowerCase().includes(lower) ||
          a.lastName.toLowerCase().includes(lower) ||
          a.country.toLowerCase().includes(lower) ||
          a.category.toLowerCase().includes(lower)
      )
    );
  }

}
