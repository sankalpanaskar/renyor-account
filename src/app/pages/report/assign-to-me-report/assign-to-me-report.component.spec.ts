import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignToMeReportComponent } from './assign-to-me-report.component';

describe('AssignToMeReportComponent', () => {
  let component: AssignToMeReportComponent;
  let fixture: ComponentFixture<AssignToMeReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignToMeReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignToMeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
