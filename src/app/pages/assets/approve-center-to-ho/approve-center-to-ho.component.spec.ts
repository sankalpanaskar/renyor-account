import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveCenterToHoComponent } from './approve-center-to-ho.component';

describe('ApproveCenterToHoComponent', () => {
  let component: ApproveCenterToHoComponent;
  let fixture: ComponentFixture<ApproveCenterToHoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveCenterToHoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveCenterToHoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
