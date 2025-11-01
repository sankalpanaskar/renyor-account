import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveCenterToCenterComponent } from './approve-center-to-center.component';

describe('ApproveCenterToCenterComponent', () => {
  let component: ApproveCenterToCenterComponent;
  let fixture: ComponentFixture<ApproveCenterToCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveCenterToCenterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveCenterToCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
