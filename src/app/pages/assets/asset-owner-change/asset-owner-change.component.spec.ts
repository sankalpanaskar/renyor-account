import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetOwnerChangeComponent } from './asset-owner-change.component';

describe('AssetOwnerChangeComponent', () => {
  let component: AssetOwnerChangeComponent;
  let fixture: ComponentFixture<AssetOwnerChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetOwnerChangeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetOwnerChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
