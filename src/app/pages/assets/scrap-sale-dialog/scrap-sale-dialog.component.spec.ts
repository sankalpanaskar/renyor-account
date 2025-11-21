import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapSaleDialogComponent } from './scrap-sale-dialog.component';

describe('ScrapSaleDialogComponent', () => {
  let component: ScrapSaleDialogComponent;
  let fixture: ComponentFixture<ScrapSaleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrapSaleDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrapSaleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
