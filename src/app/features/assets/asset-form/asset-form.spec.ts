import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AssetForm } from './asset-form';

describe('AssetForm', () => {
  let component: AssetForm;
  let fixture: ComponentFixture<AssetForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetForm],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
      ]
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
