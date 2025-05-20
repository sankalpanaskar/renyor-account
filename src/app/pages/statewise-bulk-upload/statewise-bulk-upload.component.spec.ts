import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatewiseBulkUploadComponent } from './statewise-bulk-upload.component';

describe('StatewiseBulkUploadComponent', () => {
  let component: StatewiseBulkUploadComponent;
  let fixture: ComponentFixture<StatewiseBulkUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatewiseBulkUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatewiseBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
