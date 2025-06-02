import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFlowDataComponent } from './student-flow-data.component';

describe('StudentFlowDataComponent', () => {
  let component: StudentFlowDataComponent;
  let fixture: ComponentFixture<StudentFlowDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentFlowDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentFlowDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
