import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCounselingComponent } from './manage-counseling.component';

describe('ManageCounselingComponent', () => {
  let component: ManageCounselingComponent;
  let fixture: ComponentFixture<ManageCounselingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageCounselingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCounselingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
