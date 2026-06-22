import { Component, ElementRef, forwardRef, HostListener, Input, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';


@Component({
  selector: 'ngx-search-select',
  templateUrl: './search-select.component.html',
  styleUrls: ['./search-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchSelectComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SearchSelectComponent),
      multi: true,
    },
  ],
})
export class SearchSelectComponent {
  @Input() options: any[] = [];
  @Input() placeholder = 'Search and select';
  @Input() displayKey = 'name';
  @Input() valueKey = 'id';
  @Input() noResultsText = 'No results found';
  @Input() required = false;
  @Input() disabled = false;
  @Input() editable = false;

  searchText = '';
  selectedValue: any = '';
  isOpen = false;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private hostElement: ElementRef<HTMLElement>) {}

  get displayText(): string {
    return this.getLabelFromValue(this.selectedValue);
  }

  get inputText(): string {
    if (this.editable && this.isOpen) {
      return this.searchText;
    }

    if (this.editable && (this.searchText || !this.selectedValue)) {
      return this.searchText || this.displayText;
    }

    return this.displayText;
  }

  get filteredOptions(): any[] {
    const term = this.searchText.trim().toLowerCase();
    if (!term) {
      return this.options || [];
    }

    return (this.options || []).filter((option) =>
      this.getOptionLabel(option).toLowerCase().includes(term),
    );
  }

  writeValue(value: any): void {
    this.selectedValue = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  validate(_: AbstractControl): ValidationErrors | null {
    if (!this.required) {
      return null;
    }

    return this.selectedValue === null || this.selectedValue === undefined || this.selectedValue === ''
      ? { required: true }
      : null;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }

    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      }, 0);
      // Do NOT reset searchText when opening
    } else {
      this.searchText = '';
      this.onTouched();
    }
  }

  onInputFocus(event: Event): void {
    if (this.disabled) {
      return;
    }

    this.isOpen = true;
    if (this.editable) {
      const target = event.target as HTMLInputElement;
      this.searchText = target.value || this.searchText || this.displayText;
      setTimeout(() => {
        this.searchInput?.nativeElement.setSelectionRange(
          this.searchInput.nativeElement.value.length,
          this.searchInput.nativeElement.value.length
        );
      }, 0);
    }
  }

  onMainInput(event: Event): void {
    if (!this.editable) {
      return;
    }

    const input = event.target as HTMLInputElement;
    this.searchText = input.value || '';
    this.isOpen = true;
    this.selectedValue = '';
    this.onChange(this.selectedValue);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value || '';
    this.isOpen = true;
  }
  

  selectOption(option: any, event: MouseEvent): void {
    event.preventDefault();

    this.selectedValue = this.getOptionValue(option);
    this.onChange(this.selectedValue);
    this.onTouched();
    this.isOpen = false;
    this.searchText = '';
  }

  selectExactMatch(): void {
    if (!this.editable) {
      return;
    }

    const exactMatch = (this.options || []).find(
      (option) => this.getOptionLabel(option).toLowerCase() === this.searchText.trim().toLowerCase()
    );

    if (exactMatch) {
      this.selectedValue = this.getOptionValue(exactMatch);
      this.onChange(this.selectedValue);
      this.onTouched();
      this.isOpen = false;
      this.searchText = '';
      return;
    }

    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent): void {
    if (!this.hostElement.nativeElement.contains(event.target as Node)) {
      if (this.isOpen) {
        this.isOpen = false;
        if (!this.editable) {
          this.searchText = '';
        }
        this.onTouched();
      }
    }
  }

  getOptionLabel(option: any): string {
    if (option == null) {
      return '';
    }

    if (typeof option === 'string' || typeof option === 'number') {
      return String(option);
    }

    const label = option?.[this.displayKey];
    return label == null ? '' : String(label);
  }

  private getOptionValue(option: any): any {
    if (option == null) {
      return '';
    }

    if (typeof option === 'string' || typeof option === 'number') {
      return option;
    }

    return option?.[this.valueKey];
  }

  private getLabelFromValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const matchedOption = (this.options || []).find((option) => this.getOptionValue(option) === value);
    if (!matchedOption) {
      return '';
    }

    return this.getOptionLabel(matchedOption);
  }
}
