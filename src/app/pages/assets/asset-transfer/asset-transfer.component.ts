import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-asset-transfer',
  templateUrl: './asset-transfer.component.html',
  styleUrls: ['./asset-transfer.component.scss']
})
export class AssetTransferComponent implements OnInit{
 model: any = [];
  isSubmitting: boolean = false;

  
 constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
  }

  onSubmit(fm: any) {
    if (!fm.valid) return;
    }
}
