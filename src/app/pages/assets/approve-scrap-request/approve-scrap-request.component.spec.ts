import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveScrapRequestComponent } from './approve-scrap-request.component';

describe('ApproveScrapRequestComponent', () => {
  let component: ApproveScrapRequestComponent;
  let fixture: ComponentFixture<ApproveScrapRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveScrapRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveScrapRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
