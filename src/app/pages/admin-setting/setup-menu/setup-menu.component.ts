import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'ngx-setup-menu',
  templateUrl: './setup-menu.component.html',
  styleUrls: ['./setup-menu.component.scss']
})
export class SetupMenuComponent implements OnInit {
  model: any = this.createEmptyMenuModel();
  isSubmitting = false;
  isLoadingTree = false;
  showAddMenuPopup = false;
  parentMenuList: any[] = [this.getEmptyParentOption()];
  menuTreeList: any[] = [];
  totalMenuCount = 0;

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
  ) {}

  ngOnInit(): void {
    this.getParentMenu();
    this.getMenuTree();
  }

  private createEmptyMenuModel(): any {
    return {
      menu_name: '',
      parent_id: 0,
      icon: '',
      link: '',
    };
  }

  private getEmptyParentOption(): any {
    return { id: 0, menu_name: 'None — create parent menu' };
  }

  getParentMenu(): void {
    this.globalService.getParentMenuList().subscribe({
      next: (res: any) => {
        const parentMenus = res?.data || res || [];
        const normalizedParents = Array.isArray(parentMenus)
          ? parentMenus.map((parent: any) => ({
              ...parent,
              id: parent?.id ?? parent?.menu_id ?? parent?.parent_id,
              menu_name: parent?.menu_name || parent?.title || parent?.name || 'Untitled Menu',
            }))
              .filter((parent: any) => parent.id !== null && parent.id !== undefined)
          : [];

        this.parentMenuList = [
          this.getEmptyParentOption(),
          ...normalizedParents,
        ];
      },
      error: (err: any) => {
        this.toastrService.danger(err?.message || 'Unable to load parent menus', 'Error!');
      }
    });
  }

  getMenuTree(): void {
    this.isLoadingTree = true;
    this.globalService.getMenuTree().subscribe({
      next: (res: any) => {
        const menuData = res?.data || res || [];
        this.menuTreeList = Array.isArray(menuData)
          ? menuData.map((menu: any) => this.normalizeMenu(menu))
          : [];
        this.totalMenuCount = this.countMenus(this.menuTreeList);
        this.isLoadingTree = false;
      },
      error: (err: any) => {
        this.toastrService.danger(err?.message || 'Unable to load menu tree', 'Error!');
        this.isLoadingTree = false;
      }
    });
  }

  openAddMenuPopup(): void {
    this.model = this.createEmptyMenuModel();
    this.getParentMenu();
    this.showAddMenuPopup = true;
  }

  closeAddMenuPopup(form?: any): void {
    if (this.isSubmitting) {
      return;
    }

    form?.resetForm(this.createEmptyMenuModel());
    this.model = this.createEmptyMenuModel();
    this.showAddMenuPopup = false;
  }

  onSubmit(form: any): void {
    if (form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.globalService.addMenu({ ...this.model }).subscribe({
      next: (res: any) => {
        this.toastrService.success(res?.message || 'Menu created successfully', 'Menu');
        this.isSubmitting = false;
        form.resetForm(this.createEmptyMenuModel());
        this.model = this.createEmptyMenuModel();
        this.showAddMenuPopup = false;
        this.getParentMenu();
        this.getMenuTree();
      },
      error: (err: any) => {
        this.toastrService.danger(err?.message || 'Unable to create menu', 'Error!');
        this.isSubmitting = false;
      },
    });
  }

  private normalizeMenu(menu: any): any {
    const children = menu?.children || menu?.submenus || menu?.items || [];

    return {
      ...menu,
      _title: menu?.title || menu?.menu_name || menu?.name || 'Untitled Menu',
      _link: menu?.link || menu?.url || 'No route configured',
      _children: Array.isArray(children)
        ? children.map((child: any) => this.normalizeMenu(child))
        : [],
    };
  }

  private countMenus(menus: any[]): number {
    return menus.reduce((total: number, menu: any) => {
      return total + 1 + this.countMenus(menu?._children || []);
    }, 0);
  }
}
