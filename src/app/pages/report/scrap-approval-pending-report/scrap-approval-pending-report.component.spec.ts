import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapApprovalPendingReportComponent } from './scrap-approval-pending-report.component';

describe('ScrapApprovalPendingReportComponent', () => {
  let component: ScrapApprovalPendingReportComponent;
  let fixture: ComponentFixture<ScrapApprovalPendingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrapApprovalPendingReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrapApprovalPendingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
