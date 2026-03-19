import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScoringFeature } from './scoring-feature';

describe('ScoringFeature', () => {
  let component: ScoringFeature;
  let fixture: ComponentFixture<ScoringFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoringFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoringFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
