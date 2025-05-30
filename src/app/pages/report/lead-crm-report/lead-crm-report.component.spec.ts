import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadCrmReportComponent } from './lead-crm-report.component';

describe('LeadCrmReportComponent', () => {
  let component: LeadCrmReportComponent;
  let fixture: ComponentFixture<LeadCrmReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeadCrmReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadCrmReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
