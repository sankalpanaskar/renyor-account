import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadEditDialogComponent } from './lead-edit-dialog.component';

describe('LeadEditDialogComponent', () => {
  let component: LeadEditDialogComponent;
  let fixture: ComponentFixture<LeadEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeadEditDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
