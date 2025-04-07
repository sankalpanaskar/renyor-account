import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadLeadComponent } from './upload-lead.component';

describe('UploadLeadComponent', () => {
  let component: UploadLeadComponent;
  let fixture: ComponentFixture<UploadLeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadLeadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
