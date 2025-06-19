import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetAllotmentUploadComponent } from './budget-allotment-upload.component';

describe('BudgetAllotmentUploadComponent', () => {
  let component: BudgetAllotmentUploadComponent;
  let fixture: ComponentFixture<BudgetAllotmentUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BudgetAllotmentUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetAllotmentUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
