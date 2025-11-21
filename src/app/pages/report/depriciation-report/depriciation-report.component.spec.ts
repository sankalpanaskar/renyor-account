import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepriciationReportComponent } from './depriciation-report.component';

describe('DepriciationReportComponent', () => {
  let component: DepriciationReportComponent;
  let fixture: ComponentFixture<DepriciationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepriciationReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepriciationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
