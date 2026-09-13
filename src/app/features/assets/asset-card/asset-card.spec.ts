import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCard } from './asset-card';

describe('AssetCard', () => {
  let component: AssetCard;
  let fixture: ComponentFixture<AssetCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetCard]
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
