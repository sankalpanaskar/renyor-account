import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateBulkLeadComponent } from './state-bulk-lead.component';

describe('StateBulkLeadComponent', () => {
  let component: StateBulkLeadComponent;
  let fixture: ComponentFixture<StateBulkLeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StateBulkLeadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StateBulkLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
