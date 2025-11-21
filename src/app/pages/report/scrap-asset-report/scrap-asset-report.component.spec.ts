import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapAssetReportComponent } from './scrap-asset-report.component';

describe('ScrapAssetReportComponent', () => {
  let component: ScrapAssetReportComponent;
  let fixture: ComponentFixture<ScrapAssetReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrapAssetReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrapAssetReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
