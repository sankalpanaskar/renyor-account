import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-asset-list',
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.scss']
})
export class AssetListComponent implements OnInit{
 model: any = [];
  isSubmitting: boolean = false;


  
 constructor(
    private globalService: GlobalService,
    private toastrService: NbToastrService
  ) { }

  
  ngOnInit(): void {
    console.log("member is", this.globalService.member_id, this.globalService.role_id);
  }

}
