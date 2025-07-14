import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountRecievedFromDonorComponent } from './amount-recieved-from-donor.component';

describe('AmountRecievedFromDonorComponent', () => {
  let component: AmountRecievedFromDonorComponent;
  let fixture: ComponentFixture<AmountRecievedFromDonorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmountRecievedFromDonorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmountRecievedFromDonorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
