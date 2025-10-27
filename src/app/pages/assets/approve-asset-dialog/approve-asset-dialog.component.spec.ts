import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveAssetDialogComponent } from './approve-asset-dialog.component';

describe('ApproveAssetDialogComponent', () => {
  let component: ApproveAssetDialogComponent;
  let fixture: ComponentFixture<ApproveAssetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveAssetDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveAssetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
