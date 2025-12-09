import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferApprovalReportComponent } from './transfer-approval-report.component';

describe('TransferApprovalReportComponent', () => {
  let component: TransferApprovalReportComponent;
  let fixture: ComponentFixture<TransferApprovalReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferApprovalReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferApprovalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
