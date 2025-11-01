import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetHistoryComponent } from './asset-history.component';

describe('AssetHistoryComponent', () => {
  let component: AssetHistoryComponent;
  let fixture: ComponentFixture<AssetHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
