import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterBulkLeadComponent } from './center-bulk-lead.component';

describe('CenterBulkLeadComponent', () => {
  let component: CenterBulkLeadComponent;
  let fixture: ComponentFixture<CenterBulkLeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CenterBulkLeadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CenterBulkLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
