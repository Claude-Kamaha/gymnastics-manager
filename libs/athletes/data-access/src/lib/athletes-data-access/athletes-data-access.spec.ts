import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AthletesDataAccess } from './athletes-data-access';

describe('AthletesDataAccess', () => {
  let component: AthletesDataAccess;
  let fixture: ComponentFixture<AthletesDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AthletesDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(AthletesDataAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
