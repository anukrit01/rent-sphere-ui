import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaserDashboard } from './leaser-dashboard';

describe('LeaserDashboard', () => {
  let component: LeaserDashboard;
  let fixture: ComponentFixture<LeaserDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaserDashboard]
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
