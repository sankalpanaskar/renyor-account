import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-buyer-list',
  templateUrl: './buyer-list.component.html',
  styleUrls: ['./buyer-list.component.scss']
})
export class BuyerListComponent {
  model: any = [];
  isSubmitting: boolean = false;
  buyerList: any = [];
  filteredbuyerList: any = [];
  masterSelected: boolean = false;
  showAssetList = false;
  searchTextStudent = '';

  constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.loadBuyer();
  }

  loadBuyer() {
    this.isSubmitting = true;
    this.globalService.getBuyerList().subscribe({
      next: (res) => {
        this.buyerList = res.data.map(buyer => ({
          ...buyer,
          // isSelected: false
        }));
        this.filteredbuyerList = [...this.buyerList];
        this.masterSelected = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('State error:', err);
        this.toastrService.danger(err.message, 'Error');
        this.isSubmitting = false;
      },
    })
  }

filterAsset() {
  const text = this.searchTextStudent?.toLowerCase().trim();
  if (text) {
    this.filteredbuyerList = this.buyerList.filter((buyer: any) => {
      // helper to safely convert anything to lowercase string
      const toLower = (value: any) =>
        (value ?? '').toString().toLowerCase();

      return (
        toLower(buyer.name).includes(text) ||
        toLower(buyer.buyer_id).includes(text) ||
        toLower(buyer.state).includes(text) ||
        toLower(buyer.city).includes(text) ||
        toLower(buyer.address).includes(text) ||
        toLower(buyer.register_status).includes(text) ||
        toLower(buyer.gst_no).includes(text) ||     // now safe if null
        toLower(buyer.pan_no).includes(text) ||
        toLower(buyer.pincode).includes(text)       // safe if number/string/null
      );
    });
  } else {
    this.filteredbuyerList = [...this.buyerList];
  }
}


  selectAll() {
    this.buyerList.forEach(asset => {
      asset.isSelected = this.masterSelected;
    });
  }

  checkIfAllSelected() {
    this.masterSelected = this.buyerList.every(buyer => buyer.isSelected);
  }

  get selectedCount(): number {
    return this.buyerList.filter(buyer => buyer.isSelected).length;
  }

}
