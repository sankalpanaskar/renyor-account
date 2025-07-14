import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetExpensesUploadComponent } from './budget-expenses-upload.component';

describe('BudgetExpensesUploadComponent', () => {
  let component: BudgetExpensesUploadComponent;
  let fixture: ComponentFixture<BudgetExpensesUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BudgetExpensesUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetExpensesUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
