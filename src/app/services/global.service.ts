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
  
    public currentUser: any;
    public member_id = '';
    public fullName = '';
    public mobile = '';
    public user_id = '';
    public centerData:any=[];
    public user_code: '';

  
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
    public getExcelPath(): Observable<any> {
    return this.http.get(`${this.leadUrl}/download-excel`);
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
    return this.http.get(`${this.assetUrl}/brand-list`);
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

  public SearchAsset(data: any): Observable<any> {
    return this.http.post(`${this.assetUrl}/asset-list`, data);
  }


}
