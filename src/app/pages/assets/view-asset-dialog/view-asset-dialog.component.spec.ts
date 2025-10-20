import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssetDialogComponent } from './view-asset-dialog.component';

describe('ViewAssetDialogComponent', () => {
  let component: ViewAssetDialogComponent;
  let fixture: ComponentFixture<ViewAssetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAssetDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAssetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
