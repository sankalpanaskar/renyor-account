import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsReportComponent } from './assets-report.component';

describe('AssetsReportComponent', () => {
  let component: AssetsReportComponent;
  let fixture: ComponentFixture<AssetsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetsReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
