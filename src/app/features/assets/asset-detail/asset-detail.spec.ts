import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AssetDetail } from './asset-detail';

describe('AssetDetail', () => {
  let component: AssetDetail;
  let fixture: ComponentFixture<AssetDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetDetail],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
