import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAssetFormComponent } from './add-asset-form.component';

describe('AddAssetFormComponent', () => {
  let component: AddAssetFormComponent;
  let fixture: ComponentFixture<AddAssetFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAssetFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAssetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
