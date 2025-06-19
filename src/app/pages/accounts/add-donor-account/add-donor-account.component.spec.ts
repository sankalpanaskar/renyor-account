import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDonorAccountComponent } from './add-donor-account.component';

describe('AddDonorAccountComponent', () => {
  let component: AddDonorAccountComponent;
  let fixture: ComponentFixture<AddDonorAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDonorAccountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDonorAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
