import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCard } from './asset-card';

describe('AssetCard', () => {
  let component: AssetCard;
  let fixture: ComponentFixture<AssetCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetCard],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
