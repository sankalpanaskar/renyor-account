import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupMenuComponent } from './setup-menu.component';

describe('SetupMenuComponent', () => {
  let component: SetupMenuComponent;
  let fixture: ComponentFixture<SetupMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetupMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetupMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
