import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelErrorDialogComponent } from './excel-error-dialog.component';

describe('ExcelErrorDialogComponent', () => {
  let component: ExcelErrorDialogComponent;
  let fixture: ComponentFixture<ExcelErrorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcelErrorDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcelErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
