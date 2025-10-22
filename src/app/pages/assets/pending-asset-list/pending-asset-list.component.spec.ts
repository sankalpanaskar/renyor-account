import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingAssetListComponent } from './pending-asset-list.component';

describe('PendingAssetListComponent', () => {
  let component: PendingAssetListComponent;
  let fixture: ComponentFixture<PendingAssetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingAssetListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingAssetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
