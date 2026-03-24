import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AthletesUi } from './athletes-form';

describe('AthletesUi', () => {
  let component: AthletesUi;
  let fixture: ComponentFixture<AthletesUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AthletesUi],
    }).compileComponents();

    fixture = TestBed.createComponent(AthletesUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
