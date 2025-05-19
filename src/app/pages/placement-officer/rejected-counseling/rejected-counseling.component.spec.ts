import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedCounselingComponent } from './rejected-counseling.component';

describe('RejectedCounselingComponent', () => {
  let component: RejectedCounselingComponent;
  let fixture: ComponentFixture<RejectedCounselingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectedCounselingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectedCounselingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
