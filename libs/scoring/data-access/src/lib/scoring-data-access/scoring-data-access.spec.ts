import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScoringDataAccess } from './scoring-data-access';

describe('ScoringDataAccess', () => {
  let component: ScoringDataAccess;
  let fixture: ComponentFixture<ScoringDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoringDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoringDataAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
