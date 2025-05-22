import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcomDashboardComponent } from './marcom-dashboard.component';

describe('MarcomDashboardComponent', () => {
  let component: MarcomDashboardComponent;
  let fixture: ComponentFixture<MarcomDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarcomDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcomDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
