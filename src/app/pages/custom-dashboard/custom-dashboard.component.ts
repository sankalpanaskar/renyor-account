import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { NbThemeService, NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-custom-dashboard',
  templateUrl: './custom-dashboard.component.html',
  styleUrls: ['./custom-dashboard.component.scss']
})
export class CustomDashboardComponent implements OnInit {

  model: any = [];
  assets: any[] = [];
  centers: any[] = [];
  isSubmitting = false;

  constructor(
    public globalService: GlobalService,
    private toastrService: NbToastrService,
    private themeService: NbThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    //console.log('member is', this.globalService.member_id, this.globalService.role_id, this.globalService.user_code);
    this.loadDashboardData();
  }

  // ✅ Fetch Dashboard data dynamically
  loadDashboardData() {
    const payload = {
      user_id: this.globalService.user_id,
      member_id: this.globalService.member_id,
    };

    this.isSubmitting = true;

    this.globalService.getCustomerList().subscribe({
      next: (res: any) => {
        console.log('📦 Raw dashboard API response:', res);
        this.isSubmitting = false;

        if (res?.status && res?.data) {
          const apiAssets = res.data.asset_details || [];
          const apiCenters = res.data.centers || [];

          // ✅ Map API asset data into your display structure
          this.assets = apiAssets.map((item: any) => ({
            label: item.assets_sub_class,
            count: item.subclass_count,
            icon: this.getIconForAsset(item.assets_sub_class),
          }));

          // ✅ Centers (if any)
          this.centers = apiCenters.map((center: any, index: number) => ({
            id: index + 1,
            name: center.name || 'N/A',
            code: center.short_code || 'N/A',
          }));

          this.toastrService.success(res?.message || 'Dashboard loaded successfully', 'Success');
        } else {
          this.toastrService.warning('No data found', 'Warning');
        }
      },
      error: (err) => {
        console.error('❌ Dashboard API error:', err);
        this.toastrService.danger(err?.error?.message || 'Failed to load dashboard data', 'Error');
        this.isSubmitting = false;
      },
    });
  }

  // ✅ Helper function to assign icons dynamically
  getIconForAsset(assetName: string): string {
    const name = assetName.toLowerCase();

    if (name.includes('cpu')) return 'hard-drive-outline';
    if (name.includes('monitor')) return 'monitor-outline';
    if (name.includes('switch')) return 'shuffle-outline';
    if (name.includes('web') || name.includes('camera')) return 'video-outline';
    if (name.includes('battery')) return 'battery-outline';
    if (name.includes('projector')) return 'tv-outline';
    if (name.includes('biometric')) return 'person-done-outline';
    if (name.includes('router') || name.includes('wifi')) return 'wifi-outline';
    if (name.includes('printer')) return 'printer-outline';
    if (name.includes('speaker')) return 'volume-up-outline';
    if (name.includes('ups')) return 'flash-outline';
    if (name.includes('laptop')) return 'monitor-outline';
    if (name.includes('tablet')) return 'smartphone-outline';
    if (name.includes('scanner')) return 'copy-outline';
    if (name.includes('server')) return 'hard-drive-outline';
    if (name.includes('chair')) return 'cube-outline';
    if (name.includes('table')) return 'grid-outline';
    if (name.includes('fire')) return 'alert-triangle-outline';
    if (name.includes('water')) return 'droplet-outline';
    if (name.includes('rack')) return 'layers-outline';
    if (name.includes('air')) return 'thermometer-minus-outline';
    if (name.includes('mobile')) return 'smartphone-outline';
    if (name.includes('almirah')) return 'archive-outline';
    if (name.includes('shred')) return 'scissors-outline';
    if (name.includes('nvr')) return 'film-outline';

    // default icon
    return 'cube-outline';
  }
}
