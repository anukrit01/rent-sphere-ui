import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { RenterDashboard } from './renter-dashboard';

describe('RenterDashboard', () => {
  let component: RenterDashboard;
  let fixture: ComponentFixture<RenterDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenterDashboard],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenterDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
