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
      this.centerData = user.assgin_centers;
    }
  

  // private apiUrl = 'https://ticketapi.anudip.org/public/api/raiseticket';
  private apiUrl= environment.apiBaseUrl+ 'api';
  private leadUrl= environment.apiBaseUrl+ 'api'+ '/lead';

  // constructor(private http: HttpClient) {}

  // ADD LEAD FORM

  public getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-degree`);
  }

  public getCenter(data): Observable<any> {
    return this.http.post(`${this.leadUrl}/get-center`,data);
  }

  public getStates(): Observable<any> {
    return this.http.get(`${this.leadUrl}/get-state`);
  }

  public getDistric(data: any): Observable<any> {
    return this.http.post(`${this.leadUrl}/get-district`,data);
  }
  
  public getCourses(centerId): Observable<any> {
    return this.http.get(`${this.leadUrl}/get-course/${centerId}`);
  }

  public getSources(): Observable<any> {
    return this.http.get(`${this.leadUrl}/fetch-lead-source`);
  }

  public leadSubmit(data: any): Observable<any> {
    return this.http.post(`${this.leadUrl}/add-lead`,data);
  }

  // Upload Bulk Lead Apis

  public getCenterBulk(): Observable<any> {
    return this.http.get(`${this.leadUrl}/get-center-bulk-upload`);
  }

  public uploadLeads(data: any): Observable<any> {
    return this.http.post(`${this.leadUrl}/''`,data);
  }

  public getExcelPath(): Observable<any> {
    return this.http.get(`${this.leadUrl}/download-excel`);
  }

  // Manage Leads Apis

  public getLeadData(centerId:any): Observable<any> {
    return this.http.post(`${this.leadUrl}/active-leads`,centerId);
  }

  // Update Leads Apis

  public getStatusList(): Observable<any> {
    return this.http.get(`${this.leadUrl}/get-lead-status`);
  }

  public getStageList(statusId: any): Observable<any> {
    return this.http.get(`${this.leadUrl}/get-lead-stage/${statusId}`);
  }

  public leadUpdate(data: any): Observable<any> {
    return this.http.post(`${this.leadUrl}/update-lead`,data);
  }

  public counselingLeadUpdate(data: any): Observable<any> {
    return this.http.post(`${this.leadUrl}/counselling-link-send`,data);
  }

  public getLeadsFlow(leadId: any): Observable<any> {
    return this.http.get(`${this.leadUrl}/fetch-lead-all-stages/${leadId}`);
  }

  // Student Form API

  public getStudentData(leadId: any): Observable<any> {
    return this.http.post(`${this.leadUrl}/lead-data-by-id`,leadId);
  }

    public getStudentStreams(): Observable<any> {
    return this.http.get(`${this.leadUrl}/get-stream`);
  }

  public saveStudentForm(leadId: any): Observable<any> {
    return this.http.post(`${this.leadUrl}/insert-student-answer`,leadId);
        // return this.http.post(`${this.leadUrl}/""`,leadId);
  }

   public saveRejectedPOAnswers(leadId: any): Observable<any> {
    return this.http.post(`${this.leadUrl}/accept-rejected-students`,leadId);
        // return this.http.post(`${this.leadUrl}/""`,leadId);
  }

  // PO Student List API
  public getCenterFilter(data: any): Observable<any> {
    return this.http.post(`${this.leadUrl}/get-center-filter`,data);
  }

  public getStudentList(centerId: any): Observable<any> {
    return this.http.get(`${this.leadUrl}/get-student-for-PO/${centerId}`);
  }

  // for getting rejected student
   public getRejectedStudentList(centerId: any): Observable<any> {
    return this.http.get(`${this.leadUrl}/get-rejected-students/${centerId}`);
  }

  public poIterviewSubmit(data: any): Observable<any> {
    return this.http.post(`${this.leadUrl}/""`,data);
  }

  // PO Apis
  public getStudentDataPO(leadId: any): Observable<any> {
    return this.http.post(`${this.leadUrl}/lead-data-po`,leadId);
  }

  //student registration
  public getCenterReg(data): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-center`,data);
  }

  public getStatesReg(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-state`);
  }

  public getDistricReg(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-district`,data);
  }
  
  public getCoursesReg(centerId): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-course/${centerId}`);
  }

  public getSourcesReg(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fetch-lead-source`);
  }

  public leadSubmitReg(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-lead`,data);
  }

   public getRejectedCenterFilter(): Observable<any> {
    return this.http.get(`${this.leadUrl}/get-rejected-centers`);
  }

  // Dashboard API
    public getStatsData(): Observable<any> {
    return this.http.get(`${this.leadUrl}/get-crm-dasboard-stats`);
  }

     public getChartData(): Observable<any> {
    return this.http.get(`${this.leadUrl}/get-monthly-crm-summary`);
  }


  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

}
