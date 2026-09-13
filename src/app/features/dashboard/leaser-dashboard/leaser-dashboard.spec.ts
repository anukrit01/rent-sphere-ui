import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { LeaserDashboard } from './leaser-dashboard';

describe('LeaserDashboard', () => {
  let component: LeaserDashboard;
  let fixture: ComponentFixture<LeaserDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaserDashboard],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaserDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
