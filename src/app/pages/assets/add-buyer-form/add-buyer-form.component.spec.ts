import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBuyerFormComponent } from './add-buyer-form.component';

describe('AddBuyerFormComponent', () => {
  let component: AddBuyerFormComponent;
  let fixture: ComponentFixture<AddBuyerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBuyerFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBuyerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
