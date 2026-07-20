import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ngx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  model: any = {};
  isSubmitting: boolean = false;
  stateList : any = [];
  industryList: string[] = [];
  organizationLogoUrl = 'assets/images/logo.png';
  selectedLogoFile: File | null = null;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.getState();
    this.getIndustries();
    this.getMyTenant();
  }

  getMyTenant(): void {
    this.isSubmitting = true;
    this.globalService.fetchMyTenant().subscribe({
      next: (res: any) => {
        console.log('fetch-my-tenant response:', res);

        const responseData = res?.data ?? res;
        const tenant = Array.isArray(responseData)
          ? responseData[0]
          : (responseData?.tenant ?? responseData);

        if (tenant && typeof tenant === 'object') {
          const stateValue = tenant.state_code ?? tenant.state ?? '';
          const matchedState = this.stateList.find((state: any) =>
            `${state?.code || ''}`.toLowerCase() === `${stateValue}`.toLowerCase()
            || `${state?.name || ''}`.toLowerCase() === `${stateValue}`.toLowerCase()
          );

          this.model = {
            ...this.model,
            ...tenant,
            state: matchedState?.code ?? stateValue
          };
          this.organizationLogoUrl = this.resolveLogoUrl(tenant.logo);
        }

        this.isSubmitting = false;
      },
      error: (err: any) => {
        console.error('fetch-my-tenant error:', err);
        this.toastrService.danger(
          err?.error?.message || 'Organization profile could not be loaded.',
          'Failed'
        );
        this.isSubmitting = false;
      }
    });
  }

  private resolveLogoUrl(logoPath: any): string {
    const path = `${logoPath || ''}`.trim();
    if (!path) {
      return 'assets/images/logo.png';
    }

    if (/^(https?:)?\/\//i.test(path) || /^(data|blob):/i.test(path)) {
      return path;
    }

    const baseUrl = `${environment.apiBaseUrl || ''}`.replace(/\/+$/, '');
    return `${baseUrl}/${path.replace(/^\/+/, '')}`;
  }

  onLogoError(): void {
    this.organizationLogoUrl = 'assets/images/logo.png';
  }

  getIndustries(): void {
    this.globalService.getIndustries().subscribe({
      next: (industries: string[]) => {
        this.industryList = Array.isArray(industries) ? industries : [];
      },
      error: () => {
        this.industryList = [];
      }
    });
  }

  getState(){
    this.globalService.getStates().subscribe({
      next: (res: any) => {
        this.stateList = res;
        this.isSubmitting = false;
        console.log(res);
      },
      error: (res: any) => {
        this.isSubmitting = false;
      }
    })
  }

  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedLogoFile = input.files?.length ? input.files[0] : null;
  }

  onSubmit(fm: any) {
    if (fm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const fields = [
      'name',
      'industry',
      'website',
      'address',
      'country',
      'city',
      'state',
      'pin',
      'phone',
      'email',
      'pan',
      'gst'
    ];

    fields.forEach((field: string) => {
      formData.append(field, `${this.model?.[field] ?? ''}`);
    });

    if (this.selectedLogoFile) {
      formData.append('logo', this.selectedLogoFile);
    }

    this.globalService.updateMyTenant(formData).subscribe({
      next: (res: any) => {
        this.toastrService.success(
          res?.message || 'Organization profile updated successfully.',
          'Success!'
        );
        this.selectedLogoFile = null;
        this.getMyTenant();
      },
      error: (err: any) => {
        this.toastrService.danger(
          err?.error?.message || err?.message || 'Organization profile could not be updated.',
          'Error!'
        );
        this.isSubmitting = false;
      }
    });
  }

}
