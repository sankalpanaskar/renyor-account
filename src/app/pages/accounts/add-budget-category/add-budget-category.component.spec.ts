import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBudgetCategoryComponent } from './add-budget-category.component';

describe('AddBudgetCategoryComponent', () => {
  let component: AddBudgetCategoryComponent;
  let fixture: ComponentFixture<AddBudgetCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBudgetCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBudgetCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
