import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface ProfileDetail {
  label: string;
  value: string;
  icon: string;
}

interface UserProfileView {
  name: string;
  initials: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  statusActive: boolean;
  designation: string;
  department: string;
  location: string;
  company: string;
  packageName: string;
  industry: string;
  businessEmail: string;
  businessPhone: string;
  website: string;
  address: string;
  pan: string;
  gst: string;
  image: string;
  createdAt: string;
  isSystemAdmin: boolean;
  isCompanyAdmin: boolean;
}

@Component({
  selector: 'ngx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profile: UserProfileView | null = null;
  personalDetails: ProfileDetail[] = [];
  organizationDetails: ProfileDetail[] = [];
  profileCompletion = 0;
  storageError = '';
  showProfileImage = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadProfileFromStorage();
  }

  navigateToDashboard(): void {
    this.router.navigate(['/pages/custom-dashboard']);
  }

  handleImageError(): void {
    this.showProfileImage = false;
  }

  private loadProfileFromStorage(): void {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      this.storageError = 'No signed-in user was found in this browser session.';
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      const tenantDetails = this.parseTenantDetails(localStorage.getItem('tenant_details'));
      this.profile = this.createProfileView(user, tenantDetails);
      this.showProfileImage = !!this.profile.image;
      this.createDetailLists();
      this.calculateProfileCompletion();
    } catch (error) {
      console.error('Unable to parse the stored user profile:', error);
      this.storageError = 'The saved user profile could not be read.';
    }
  }

  private createProfileView(user: any, tenant: any): UserProfileView {
    const member = user?.member || user?.profile || user?.user_profile || {};
    const firstName = member?.first_name || user?.first_name || '';
    const lastName = member?.last_name || user?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const email = this.firstValue(user?.email, member?.email);
    const name = this.firstValue(
      fullName,
      user?.display_name,
      member?.display_name,
      user?.name,
      member?.name,
      this.getNameFromEmail(email),
      'Account user',
    );
    const image = this.resolveProfileImage(
      user?.user_image || user?.profile_image || user?.avatar || member?.user_image || member?.profile_image,
    );

    return {
      name,
      initials: this.getInitials(name),
      email: email || 'Not provided',
      mobile: this.firstValue(user?.mobile, user?.phone, member?.mobile, member?.phone, 'Not provided'),
      role: this.getUserRole(user),
      status: this.getAccountStatus(user),
      statusActive: this.isAccountActive(user),
      designation: this.firstValue(member?.designation, user?.designation, user?.job_title, 'Not provided'),
      department: this.firstValue(member?.department, user?.department, 'Not provided'),
      location: this.firstValue(
        member?.base_location,
        member?.location,
        user?.base_location,
        user?.location,
        this.getTenantLocation(tenant),
        'Not provided',
      ),
      company: this.firstValue(
        tenant?.name,
        tenant?.company_name,
        tenant?.organization_name,
        user?.company_name,
        user?.tenant_name,
        user?.tenant?.company_name,
        user?.tenant?.name,
        member?.company_name,
        'Not provided',
      ),
      packageName: this.getPackageName(tenant, user),
      industry: this.firstValue(tenant?.industry, tenant?.business_type, 'Not provided'),
      businessEmail: this.firstValue(tenant?.email, tenant?.company_email, tenant?.business_email, 'Not provided'),
      businessPhone: this.firstValue(tenant?.phone, tenant?.mobile, tenant?.company_phone, tenant?.business_phone, 'Not provided'),
      website: this.firstValue(tenant?.website, tenant?.website_url, 'Not provided'),
      address: this.getTenantAddress(tenant),
      pan: this.firstValue(tenant?.pan, tenant?.pan_number, 'Not provided'),
      gst: this.firstValue(tenant?.gst, tenant?.gst_number, tenant?.gstin, 'Not provided'),
      image,
      createdAt: this.formatDate(user?.created_at || member?.created_at),
      isSystemAdmin: this.isTruthy(user?.is_system_super_admin),
      isCompanyAdmin: this.isTruthy(user?.is_company_super_admin),
    };
  }

  private createDetailLists(): void {
    if (!this.profile) {
      return;
    }

    this.personalDetails = [
      { label: 'Full name', value: this.profile.name, icon: 'person-outline' },
      { label: 'Email address', value: this.profile.email, icon: 'email-outline' },
      { label: 'Mobile number', value: this.profile.mobile, icon: 'phone-outline' },
      { label: 'Location', value: this.profile.location, icon: 'pin-outline' },
    ];

    this.organizationDetails = [
      { label: 'Organization', value: this.profile.company, icon: 'briefcase-outline' },
      { label: 'Industry', value: this.profile.industry, icon: 'activity-outline' },
      { label: 'Business email', value: this.profile.businessEmail, icon: 'email-outline' },
      { label: 'Business phone', value: this.profile.businessPhone, icon: 'phone-outline' },
      { label: 'Website', value: this.profile.website, icon: 'globe-2-outline' },
      { label: 'Business address', value: this.profile.address, icon: 'map-outline' },
      { label: 'PAN', value: this.profile.pan, icon: 'credit-card-outline' },
      { label: 'GSTIN', value: this.profile.gst, icon: 'file-text-outline' },
    ];
  }

  private calculateProfileCompletion(): void {
    if (!this.profile) {
      return;
    }

    const values = [
      this.profile.name,
      this.profile.email,
      this.profile.mobile,
      this.profile.location,
      this.profile.company,
      this.profile.packageName,
      this.profile.industry,
      this.profile.address,
      this.profile.image,
    ];
    const populatedValues = values.filter((value: string) => !!value && value !== 'Not provided').length;
    this.profileCompletion = Math.round(populatedValues / values.length * 100);
  }

  private parseTenantDetails(storedTenant: string | null): any {
    if (!storedTenant) {
      return {};
    }

    try {
      const parsedTenant = JSON.parse(storedTenant);
      const responseData = parsedTenant?.data ?? parsedTenant;
      const tenant = responseData?.tenant ?? responseData?.tenant_details ?? responseData;
      return Array.isArray(tenant) ? (tenant[0] || {}) : (tenant || {});
    } catch (error) {
      console.warn('Unable to parse tenant_details from localStorage:', error);
      return {};
    }
  }

  private getPackageName(tenant: any, user: any): string {
    const packages = Array.isArray(tenant?.packages) ? tenant.packages : [];
    const assignedPackageId = tenant?.package_id ?? user?.package_id;
    const currentPackage = packages.find((item: any) =>
      `${item?.package_id ?? item?.id ?? ''}` === `${assignedPackageId ?? ''}`
    ) || packages.find((item: any) =>
      this.isTruthy(item?.is_current) || this.isTruthy(item?.is_active) || `${item?.status || ''}`.toLowerCase() === 'active'
    ) || packages[0];

    return this.firstValue(
      tenant?.package_name,
      tenant?.package?.package_name,
      tenant?.current_package?.package_name,
      tenant?.subscription?.package_name,
      currentPackage?.package_name,
      user?.package_name,
      user?.package?.package_name,
      'Not provided',
    );
  }

  private getTenantAddress(tenant: any): string {
    const directAddress = this.firstValue(
      tenant?.address,
      tenant?.business_address,
      tenant?.registered_address,
    );

    if (directAddress) {
      return directAddress;
    }

    const addressParts = [
      tenant?.address_line_1 || tenant?.address1,
      tenant?.address_line_2 || tenant?.address2,
      tenant?.city,
      tenant?.state_name || tenant?.state,
      tenant?.pin || tenant?.pincode || tenant?.postal_code,
      tenant?.country,
    ].map((value: any) => `${value || ''}`.trim()).filter(Boolean);

    return addressParts.join(', ') || 'Not provided';
  }

  private getTenantLocation(tenant: any): string {
    const parts = [
      tenant?.city,
      tenant?.state_name || tenant?.state,
      tenant?.country,
    ].map((value: any) => `${value || ''}`.trim()).filter(Boolean);

    return parts.join(', ');
  }

  private getUserRole(user: any): string {
    if (this.isTruthy(user?.is_system_super_admin)) {
      return 'System Administrator';
    }

    const directRole = user?.role_name
      || user?.role?.role_name
      || user?.role?.name
      || (typeof user?.role === 'string' ? user.role : '');

    if (`${directRole || ''}`.trim()) {
      return `${directRole}`.trim();
    }

    if (Array.isArray(user?.roles)) {
      const roleNames = user.roles
        .map((role: any) => role?.role_name || role?.name || (typeof role === 'string' ? role : ''))
        .filter(Boolean);

      if (roleNames.length) {
        return roleNames.join(', ');
      }
    }

    if (this.isTruthy(user?.is_company_super_admin)) {
      return 'Company Administrator';
    }

    return user?.role_id ? `Role ${user.role_id}` : 'User';
  }

  private getAccountStatus(user: any): string {
    return this.isAccountActive(user) ? 'Active account' : 'Inactive account';
  }

  private isAccountActive(user: any): boolean {
    const status = user?.status ?? user?.is_active ?? user?.active;

    if (status === undefined || status === null || status === '') {
      return true;
    }

    if (typeof status === 'string') {
      return ['1', 'true', 'active', 'enabled'].includes(status.trim().toLowerCase());
    }

    return status === 1 || status === true;
  }

  private resolveProfileImage(value: any): string {
    const image = `${value || ''}`.trim();
    if (!image) {
      return '';
    }

    if (/^(https?:\/\/|data:|blob:|assets\/)/i.test(image)) {
      return image;
    }

    const cleanPath = image.replace(/^\/+/, '');
    if (cleanPath.includes('/')) {
      return `${environment.apiBaseUrl}${cleanPath}`;
    }

    return `${environment.apiBaseUrl}uploads/user_image/${cleanPath}`;
  }

  private getInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part.charAt(0).toUpperCase())
      .join('') || 'U';
  }

  private getNameFromEmail(email: string): string {
    const emailName = `${email || ''}`.split('@')[0];
    return emailName
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (character: string) => character.toUpperCase());
  }

  private formatDate(value: any): string {
    if (!value) {
      return 'Not available';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return `${value}`;
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private firstValue(...values: any[]): string {
    const value = values.find((candidate: any) =>
      candidate !== undefined && candidate !== null && `${candidate}`.trim() !== ''
    );
    return value === undefined ? '' : `${value}`.trim();
  }

  private isTruthy(value: any): boolean {
    return value === true || value === 1 || `${value}`.trim().toLowerCase() === 'true' || `${value}` === '1';
  }
}
