import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapSaleDetailsComponent } from './scrap-sale-details.component';

describe('ScrapSaleDetailsComponent', () => {
  let component: ScrapSaleDetailsComponent;
  let fixture: ComponentFixture<ScrapSaleDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrapSaleDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrapSaleDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
