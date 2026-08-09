import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { GlobalService } from '../../../services/global.service';

export interface GroupOption {
  id?: string | number;
  groupName: string;
  groupDescription?: string;
}

@Component({
  selector: 'ngx-group-popup',
  templateUrl: './group-popup.component.html',
  styleUrls: ['./group-popup.component.scss'],
})
export class GroupPopupComponent {
  @Input() open = false;
  @Input() title = 'Configure Groups';
  @Input() groups: GroupOption[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() groupsChange = new EventEmitter<GroupOption[]>();
  @Output() groupSelected = new EventEmitter<string>();

  showAddForm = false;
  isSubmitting = false;
  newGroupName = '';
  newGroupDescription = '';

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService,
  ) {}

  closePopup(): void {
    if (this.isSubmitting) {
      return;
    }
    this.resetAddForm();
    this.close.emit();
  }

  startAddGroup(): void {
    this.showAddForm = true;
  }

  cancelAddGroup(): void {
    if (!this.isSubmitting) {
      this.resetAddForm();
    }
  }

  saveGroup(): void {
    const groupName = `${this.newGroupName || ''}`.trim();
    const groupDescription = `${this.newGroupDescription || ''}`.trim();
    if (!groupName) {
      this.toastrService.danger('Enter a group name.', 'Validation Failed');
      return;
    }

    this.isSubmitting = true;
    this.globalService.createGroup({
      group_name: groupName,
      group_description: groupDescription,
    }).subscribe({
      next: (res: any) => {
        const createdGroup: GroupOption = {
          id: res?.data?.id ?? res?.data?.group_id ?? res?.id,
          groupName: res?.data?.group_name ?? res?.data?.name ?? groupName,
          groupDescription: res?.data?.group_description ?? groupDescription,
        };
        const nextGroups = [
          ...(this.groups || []).filter((group: GroupOption) =>
            group.groupName.trim().toLowerCase() !== createdGroup.groupName.trim().toLowerCase()
          ),
          createdGroup,
        ];

        this.groupsChange.emit(nextGroups);
        this.groupSelected.emit(createdGroup.groupName);
        this.toastrService.success(res?.message || 'Group added successfully.', 'Added');
        this.isSubmitting = false;
        this.closePopup();
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.toastrService.danger(
          error?.error?.message || error?.message || 'Group could not be added.',
          'Add Group Failed',
        );
      },
    });
  }

  selectGroup(groupName: string): void {
    this.groupSelected.emit(groupName);
    this.closePopup();
  }

  private resetAddForm(): void {
    this.showAddForm = false;
    this.newGroupName = '';
    this.newGroupDescription = '';
  }
}
