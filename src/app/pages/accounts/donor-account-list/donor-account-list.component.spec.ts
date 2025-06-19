import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonorAccountListComponent } from './donor-account-list.component';

describe('DonorAccountListComponent', () => {
  let component: DonorAccountListComponent;
  let fixture: ComponentFixture<DonorAccountListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DonorAccountListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonorAccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
