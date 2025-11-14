import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapSaleFormComponent } from './scrap-sale-form.component';

describe('ScrapSaleFormComponent', () => {
  let component: ScrapSaleFormComponent;
  let fixture: ComponentFixture<ScrapSaleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrapSaleFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrapSaleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
