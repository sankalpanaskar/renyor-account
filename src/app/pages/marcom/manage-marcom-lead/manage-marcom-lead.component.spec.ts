import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMarcomLeadComponent } from './manage-marcom-lead.component';

describe('ManageMarcomLeadComponent', () => {
  let component: ManageMarcomLeadComponent;
  let fixture: ComponentFixture<ManageMarcomLeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageMarcomLeadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageMarcomLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
