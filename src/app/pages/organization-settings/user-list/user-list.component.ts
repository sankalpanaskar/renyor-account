import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'ngx-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  loading = false;
  searchText = '';
  allUsers: any[] = [];
  apiData: any[] = [];
  showUserPopup = false;
  selectedUser: any = null;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
    private router: Router,
  ) {}

  get activeUsersCount(): number {
    return this.allUsers.filter((user: any) => this.isUserActive(user)).length;
  }

  get inactiveUsersCount(): number {
    return this.allUsers.length - this.activeUsersCount;
  }

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    this.loading = true;
    this.globalService.getUserByCompany().subscribe({
      next: (res: any) => {
        this.allUsers = res?.data || res || [];
        this.apiData = [...this.allUsers];
        this.onSearch(this.searchText);
        this.loading = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err?.message || err, 'Failed');
        this.loading = false;
      },
    });
  }

  onSearch(query: string = ''): void {
    this.searchText = query || '';
    const searchValue = this.searchText.trim().toLowerCase();

    if (!searchValue) {
      this.apiData = [...this.allUsers];
      return;
    }

    this.apiData = this.allUsers.filter((user: any) => {
      const searchableValues = [
        user?.name,
        user?.role_name,
        user?.role,
        user?.email,
        user?.phone,
        user?.mobile_no,
        user?.package_type,
      ];

      return searchableValues.some((value: any) =>
        String(value ?? '').toLowerCase().includes(searchValue)
      );
    });
  }

  clearSearch(): void {
    this.onSearch('');
  }

  isUserActive(user: any): boolean {
    const status = user?.status;
    return status === 1 || status === true || `${status}`.trim().toLowerCase() === 'active';
  }

  getUserStatus(user: any): string {
    return this.isUserActive(user) ? 'Active' : 'Inactive';
  }

  getUserRole(user: any): string {
    return user?.role_name || user?.role || '-';
  }

  getUserPhone(user: any): string {
    return user?.phone || user?.mobile_no || '-';
  }

  getUserInitials(user: any): string {
    const name = `${user?.name || user?.email || 'User'}`.trim();
    const words = name.split(/\s+/).filter(Boolean);

    return words
      .slice(0, 2)
      .map((word: string) => word.charAt(0).toUpperCase())
      .join('') || 'U';
  }

  trackByUser(index: number, user: any): number | string {
    return user?.id ?? user?.user_id ?? index;
  }

  openUserPopup(user: any): void {
    this.selectedUser = user;
    this.showUserPopup = true;
  }

  closeUserPopup(): void {
    this.showUserPopup = false;
    this.selectedUser = null;
  }

  gotoAddUser(): void {
    this.router.navigate(['pages/organization-setting/add-user']);
  }
}
