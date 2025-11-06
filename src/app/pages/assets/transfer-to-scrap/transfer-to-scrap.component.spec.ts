import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferToScrapComponent } from './transfer-to-scrap.component';

describe('TransferToScrapComponent', () => {
  let component: TransferToScrapComponent;
  let fixture: ComponentFixture<TransferToScrapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferToScrapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferToScrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
