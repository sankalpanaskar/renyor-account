import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedInterviewComponent } from './rejected-interview.component';

describe('RejectedInterviewComponent', () => {
  let component: RejectedInterviewComponent;
  let fixture: ComponentFixture<RejectedInterviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectedInterviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectedInterviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
