import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetForm } from './asset-form';

describe('AssetForm', () => {
  let component: AssetForm;
  let fixture: ComponentFixture<AssetForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
