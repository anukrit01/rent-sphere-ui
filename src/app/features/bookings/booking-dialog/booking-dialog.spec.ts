import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { BookingDialog } from './booking-dialog';

describe('BookingDialog', () => {
  let component: BookingDialog;
  let fixture: ComponentFixture<BookingDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingDialog],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MAT_DIALOG_DATA, useValue: { asset: { id: 1, title: 'Test Asset', pricePerDay: 5000, securityDeposit: 10000, city: 'Bhopal', location: 'Bhopal MP', owner: { id: 201, name: 'Vikram Patel' } } } },
        provideNoopAnimations(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
