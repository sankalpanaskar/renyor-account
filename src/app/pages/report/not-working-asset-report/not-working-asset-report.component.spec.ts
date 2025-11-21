import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotWorkingAssetReportComponent } from './not-working-asset-report.component';

describe('NotWorkingAssetReportComponent', () => {
  let component: NotWorkingAssetReportComponent;
  let fixture: ComponentFixture<NotWorkingAssetReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotWorkingAssetReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotWorkingAssetReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
