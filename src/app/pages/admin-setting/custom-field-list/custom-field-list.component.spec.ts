import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { NbToastrService } from '@nebular/theme';

import { CustomFieldListComponent } from './custom-field-list.component';
import { GlobalService } from '../../../services/global.service';

describe('CustomFieldListComponent', () => {
  let component: CustomFieldListComponent;
  let fixture: ComponentFixture<CustomFieldListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomFieldListComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: GlobalService,
          useValue: {
            fetchCustomFieldsByModule: () => of({ data: [] }),
          },
        },
        {
          provide: NbToastrService,
          useValue: {
            danger: () => void 0,
            warning: () => void 0,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomFieldListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
