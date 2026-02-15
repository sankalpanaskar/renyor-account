import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignModuleIntoPackageComponent } from './assign-module-into-package.component';

describe('AssignModuleIntoPackageComponent', () => {
  let component: AssignModuleIntoPackageComponent;
  let fixture: ComponentFixture<AssignModuleIntoPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignModuleIntoPackageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignModuleIntoPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
