import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  
    private roleIdSubject = new BehaviorSubject<any>(0);
    public roleId$ = this.roleIdSubject.asObservable();

    /** ---------- userCode (NEW) ---------- */
    private userCodeSubject = new BehaviorSubject<string>('');
    public  userCode$       = this.userCodeSubject.asObservable();
    
  
    public currentUser: any;
    public member_id = '';
    public fullName = '';
    public mobile = '';
    public user_id = '';
    public centerData:any=[];
    public user_code: string = '';   // keep a plain field too for easy reads

  
    constructor(private http: HttpClient) {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser?.role_id) {
        this.setUser(storedUser);
      }
    }
  
    set role_id(value: any) {
      this.roleIdSubject.next(value);
    }
  
    get role_id(): any {
      return this.roleIdSubject.value;
    }

      /** user_code proxy if you ever want a setter/getter */
      set userCode(value: string) {
        const code = (value || '').toUpperCase();
        this.user_code = code;
        this.userCodeSubject.next(code);
      }
      get userCode(): string {
        return this.userCodeSubject.value;
      }
  
    setUser(user: any) {
      this.currentUser = user;
      this.member_id = user.member_id || '';
      this.fullName = (user.member?.first_name || '') + ' ' + (user.member?.last_name || '');
      this.mobile = user.mobile || '';
      this.role_id = user.role_id;
      this.user_id = user.id;
      this.user_code = user.user_id;
      this.centerData = user.assgin_centers;
    }
  

  // private apiUrl = 'https://ticketapi.anudip.org/public/api/raiseticket';
  private apiUrl= environment.apiBaseUrl+ 'api';
  private assetUrl= environment.apiBaseUrl+ 'api'+ '/asset';
  private leadUrl= environment.apiBaseUrl+ 'api'+ '/asset';
  private accontUrl = environment.apiAccountBaseUrl+ 'api'+ '/account';
  // constructor(private http: HttpClient) {}
  
  //old
    public getSourcesReg(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fetch-lead-source`);
  }
    public getCenterReg(data): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-center`, data);
  }
  public getStatesReg(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-state`);
  }
   public getDistricReg(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-district`, data);
  }
   public getCoursesReg(centerId): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-course/${centerId}`);
  }
   public leadSubmitReg(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-lead`, data);
  }
    public leadSubmit(data: any): Observable<any> {
    return this.http.post(`${this.leadUrl}/add-lead`, data);
    // return this.http.post(`${this.leadUrl}/''`,data);
  }
    public downloadReport(data: any): Observable<any> {
    return this.http.post(`${this.leadUrl}/get-rolewise-report`, data);
  }


  public getDashboardButtonData(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/get-dashboard`, data);
  }

  public getBrands(): Observable<any> {
    return this.http.get(`${this.assetUrl}/get-brand-list`);
  }
  
  public getClass(): Observable<any> {
    return this.http.get(`${this.assetUrl}/class-list`);
  }

  public getSubClass(classId:any): Observable<any> {
    return this.http.get(`${this.assetUrl}/subclass-list/${classId}`);
  }

  public getFunders(): Observable<any> {
    return this.http.get(`${this.assetUrl}/funder-list`);
  }

  public submitAssetData(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/insert-asset-details`, data);
  }

  public submitAssetDataUpdate(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/update-asset-details`, data);
  }  

  public SearchAsset(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/asset-list`, data);
  }

  public getPendingAsset(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/pending-asset-list`, data);
  }

  public submitApproveAsset(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/approve-asset`, data);
  }

  public getCenterUser(userId:any): Observable<any> {
    return this.http.get(`${this.assetUrl}/user-centers/${userId}`);
  }

  public getAllCenter(): Observable<any> {
    return this.http.get(`${this.assetUrl}/get-all-centers`);
  }

  public getEmployeeCenter(centerId:any): Observable<any> {
    return this.http.get(`${this.assetUrl}/get-employee-by-center/${centerId}`);
  }

  public submitAssetTransfer(data: any): Observable<any> {
    // return this.http.post(`${this.assetUrl}/transfer-asset`, data);
    return this.http.post(`${this.assetUrl}/''`, data);
  }  

  public classByUser(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/fetch-transfer-class`, data);
  } 

  public subcClassByUser(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/fetch-transfer-subclass`, data);
  } 

  public assetListByUser(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/fetch-transfer-asset`, data);
  } 

  public assetSubListByUser(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/fetch-transfer-subclass`, data);
  } 

  public assetListTrans(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/fetch-transfer-asset`, data);
  }

  public getExcelPath(): Observable<any> {
    return this.http.get(`${this.assetUrl}/upload-excel-format`);
  }

  public uploadBulkAsset(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/fetch-transfer-asset`, data);
  }

  public getCenterApproveHO(memID:any,roleId): Observable<any> {
    return this.http.get(`${this.assetUrl}/fetch-center-to-ho/${memID}/${roleId}`);
  }

  public assetListHO(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/fetch-asset-centertoho`, data);
  }

  public submitHOApproval(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/save-ho-to-center`, data);
  } 

  public getCenterApproveCenter(memID:any,roleId:any): Observable<any> {
    return this.http.get(`${this.assetUrl}/fetch-center-to-center/${memID}/${roleId}`);
  }  

  public assetListCenter(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/fetch-asset-centertocenter`, data);
  }

  public submitCenterApproval(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/save-center-to-center`, data);
  } 
  
  public getAssetHistory(keyWord:any): Observable<any> {
    return this.http.get(`${this.assetUrl}/fetch-asset-history/${keyWord}`);
  } 
  
  public getAssetForStatus(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/fetch-asset-for-status-change`, data);
  } 

  public submitStatusChange(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/asset-status-change`, data);
  } 

  public getScrapAsset(roleId:any): Observable<any> {
    return this.http.get(`${this.assetUrl}/fetch-transfer-to-scrap/${roleId}`);
  } 

  public submitScrapRequest(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/submit-transfer-to-scrap`, data);
  } 

  public getScrapId(memId: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/fetch-active-scrap-id`, memId);
  }
  
  public getScrapAssetApprove(memId: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/fetch-active-scrap-requests`, memId);
  }

  public submitScrapApprove(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/submit-transfer-to-scrapApprove`, data);
        // return this.http.post(`${this.assetUrl}/''`, data);

  } 

  public getFundersOwner(roleId): Observable<any> {
    return this.http.get(`${this.assetUrl}/funder-scrap-owner-change/${roleId}`);
  }

  public getOwnerAssetApprove(memId: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/get-details-by-funder`, memId);
  }

  public submitOwnerChange(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/submit-change-funder`, data);
  }

  public submitAddBrand(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/add-brand`, data);
  }

  public getBrandsList(): Observable<any> {
    return this.http.get(`${this.assetUrl}/get-brand-list`);
  }

  public addBuyer(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/save-buyer`, data);
  }

  public getState(): Observable<any> {
    return this.http.get(`${this.assetUrl}/get-state`);
  }

  public getBuyerList(): Observable<any> {
    return this.http.get(`${this.assetUrl}/get-active-buyer`);
  } 
  
  public getScrapAssetForSale(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/scrap-asset-list`,data);
  }

  public assetsReport(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/asset-details-report`,data);
  }

  public submitSale(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/save-selling-details`,data);
  } 

  public getBrandList(): Observable<any> {
    return this.http.get(`${this.assetUrl}/get-brand-list`);
  }
  
  public updateBrand(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/update-brand`,data);
  } 

  public changeBrandStatus(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/deactive-brand`,data);
  } 

  public getCategoryList(): Observable<any> {
    return this.http.get(`${this.assetUrl}/get-asset-classes`);
  }

  public submitAddCategory(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/''`,data);
  } 

  public updateCategory(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/update-asset-class`,data);
  }

  public changeCategoryStatus(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/deactive-class`,data);
  } 

  public getItemList(): Observable<any> {
    return this.http.get(`${this.assetUrl}/get-asset-subclasses`);
  }

  public changeItemStatus(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/deactive-subclass`,data);
  } 

  public submitAddItem(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/insert-sub-class`,data);
  } 

  public updateItem(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/update-asset-subclass`,data);
  } 

  public getSellerDetails(): Observable<any> {
    return this.http.get(`${this.assetUrl}/get-seller-details`);
  }

  public downloadAssetSaleXls(sellerId:any): Observable<any> {
    return this.http.get(`${this.assetUrl}/seller-report/${sellerId}`);
  }

  public getScrapAssetData(sellerId:any): Observable<any> {
    return this.http.get(`${this.assetUrl}/get-seller-tr/${sellerId}`);
  }

  public assetsAssignedReport(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/asset-assigntome-report`,data);
  } 

  public depriciationReport(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/depriciation-asset-details-report`,data);
  } 

  public notWorkingAssetReport(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/not-working-asset-report`,data);
  }

  public scrapApprovalPendingReport(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/scrap-approval-pending-report`,data);
  }

  public scrapAssetReport(data:any): Observable<any> {
    return this.http.post(`${this.assetUrl}/scrap-asset-report`,data);
  }




  

}
