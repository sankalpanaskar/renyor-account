import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { NbThemeService, NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  model: any = [];
  isSubmitting = false;

  constructor(
    public globalService: GlobalService,
    private toastrService: NbToastrService,
    private themeService: NbThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
   
  }

  onSubmit(fm:any){
    
  }

}

