import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import { Score } from '../models/score.model';
import { Athlete } from '../models/athlete.model';

export interface CompetitionInfo {
  id: string;
  name: string;
  location: string;
  date: string;
  status: 'upcoming' | 'live' | 'completed';
}

const firebaseConfig = {
  apiKey: 'AIzaSyATL9rinTRT3dqmnv_huILfNvhZI4SNJkw',
  authDomain: 'gymnastics-manager.firebaseapp.com',
  projectId: 'gymnastics-manager',
  storageBucket: 'gymnastics-manager.firebasestorage.app',
  messagingSenderId: '463359386329',
  appId: '1:463359386329:web:3a9bca2cf10f8d7f6394c8',
};

@Injectable({ providedIn: 'root' })
export class ScoreBridgeService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private app: FirebaseApp;
  private db: Firestore;

  // ─── Private state ────────────────────────────────────────────────────

  private scoresSubject$ = new BehaviorSubject<Score[]>([]);
  private athletesSubject$ = new BehaviorSubject<Athlete[]>([]);
  private competitionSubject$ = new BehaviorSubject<CompetitionInfo>({
    id: 'comp-1',
    name: 'National Gymnastics Championship 2026',
    location: 'Yaoundé, Cameroon',
    date: new Date().toISOString(),
    status: 'live',
  });

  // ─── Unsubscribe handles for Firestore listeners ──────────────────────
  private unsubscribeScores?: () => void;
  private unsubscribeAthletes?: () => void;

  // ─── Public streams ───────────────────────────────────────────────────

  scores$: Observable<Score[]> = this.scoresSubject$.asObservable();
  athletes$: Observable<Athlete[]> = this.athletesSubject$.asObservable();
  competition$: Observable<CompetitionInfo> =
    this.competitionSubject$.asObservable();

  constructor() {
    // Avoid re-initializing Firebase if already initialized
    this.app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

    this.db = getFirestore(this.app);

    this.listenToScores();
    this.listenToAthletes();
  }

  // ─── Real-time Firestore listeners ────────────────────────────────────

  private listenToScores(): void {
    const scoresQuery = query(
      collection(this.db, 'scores'),
      orderBy('submittedAt', 'asc'),
    );

    this.unsubscribeScores = onSnapshot(
      scoresQuery,
      (snapshot) => {
        const scores = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Score[];
        console.log('🔥 Firestore scores updated:', scores.length);
        this.scoresSubject$.next(scores);
      },
      (error) => {
        console.error('❌ Firestore scores error:', error);
      },
    );
  }

  private listenToAthletes(): void {
    this.unsubscribeAthletes = onSnapshot(
      collection(this.db, 'athletes'),
      (snapshot) => {
        const athletes = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Athlete[];
        console.log('🔥 Firestore athletes updated:', athletes.length);
        this.athletesSubject$.next(athletes);
      },
      (error) => {
        console.error('❌ Firestore athletes error:', error);
      },
    );
  }

  // ─── Score actions ────────────────────────────────────────────────────

  async publishScore(score: Score): Promise<void> {
    try {
      await setDoc(doc(this.db, `scores/${score.id}`), score);
      console.log('✅ Score published:', score.id);
    } catch (err) {
      console.error('❌ Error publishing score:', err);
      throw err;
    }
  }

  async deleteScore(scoreId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, `scores/${scoreId}`));
      console.log('✅ Score deleted:', scoreId);
    } catch (err) {
      console.error('❌ Error deleting score:', err);
      throw err;
    }
  }

  // ─── Athlete actions ──────────────────────────────────────────────────

  async publishAthlete(athlete: Athlete): Promise<void> {
    try {
      await setDoc(doc(this.db, `athletes/${athlete.id}`), athlete);
      console.log('✅ Athlete published:', athlete.id);
    } catch (err) {
      console.error('❌ Error publishing athlete:', err);
      throw err;
    }
  }

  async deleteAthlete(athleteId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, `athletes/${athleteId}`));
      console.log('✅ Athlete deleted:', athleteId);
    } catch (err) {
      console.error('❌ Error deleting athlete:', err);
      throw err;
    }
  }

  // ─── Seed mock athletes ───────────────────────────────────────────────

  async seedAthletes(athletes: Athlete[]): Promise<void> {
    for (const athlete of athletes) {
      await this.publishAthlete(athlete);
    }
    console.log('✅ All athletes seeded to Firestore');
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    // Unsubscribe Firestore listeners to prevent memory leaks
    this.unsubscribeScores?.();
    this.unsubscribeAthletes?.();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
