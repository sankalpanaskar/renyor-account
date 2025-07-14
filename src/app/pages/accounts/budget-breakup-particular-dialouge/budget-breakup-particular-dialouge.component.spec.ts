import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetBreakupParticularDialougeComponent } from './budget-breakup-particular-dialouge.component';

describe('BudgetBreakupParticularDialougeComponent', () => {
  let component: BudgetBreakupParticularDialougeComponent;
  let fixture: ComponentFixture<BudgetBreakupParticularDialougeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BudgetBreakupParticularDialougeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetBreakupParticularDialougeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
