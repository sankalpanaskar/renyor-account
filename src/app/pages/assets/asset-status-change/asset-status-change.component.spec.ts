import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetStatusChangeComponent } from './asset-status-change.component';

describe('AssetStatusChangeComponent', () => {
  let component: AssetStatusChangeComponent;
  let fixture: ComponentFixture<AssetStatusChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetStatusChangeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetStatusChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
