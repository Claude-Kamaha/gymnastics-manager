import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AthletesFeature } from './athletes-feature';

describe('AthletesFeature', () => {
  let component: AthletesFeature;
  let fixture: ComponentFixture<AthletesFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AthletesFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(AthletesFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
