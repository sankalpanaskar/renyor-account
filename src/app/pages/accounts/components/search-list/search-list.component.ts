import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ngx-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.scss']
})
export class SearchListComponent {

  @Input() itemType: string; // Item type like 'center', 'student', etc.
  @Input() allItems: any[] = []; // List of items to display
  @Output() itemSelected = new EventEmitter<any>(); // Event to pass selected item back

  searchTerm = '';
  filteredItems = [];

  constructor() {
    // Initial population of filteredItems
    this.filteredItems = this.allItems;
  }

  filterItems() {
    if (this.searchTerm) {
      this.filteredItems = this.allItems.filter(item => 
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        item.short_code.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredItems = this.allItems;
    }
  }

  selectItem(item) {
    this.itemSelected.emit(item);  // Emit selected item
  }

  closeDialog() {
    // Close dialog logic goes here
  }

}
