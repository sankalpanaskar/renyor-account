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
  
    private apiUrl= environment.apiBaseUrl+ 'api';
    private systemUrl= environment.apiBaseUrl+ 'api'+ '/system';
    private menuUrl = environment.apiBaseUrl+ 'api' + '/menu';
    private roleUrl = environment.apiBaseUrl+ 'api' + '/roles';
    private tenantsUrl = environment.apiBaseUrl+ 'api' + '/tenants';
    private usersUrl = environment.apiBaseUrl+ 'api' + '/users';
    
    // constructor(private http: HttpClient) {}
    
    public getStates() {
      return this.http.get<any[]>('assets/data/state.json');
    }

    public getMenuByUser() {
      return this.http.get(`${this.menuUrl}/fetch-menu`);
    }
    
    public addPackage(data:any): Observable<any> {
      return this.http.post(`${this.systemUrl}/create-project-package`,data);
    }

    public gePackageList() {
      return this.http.get(`${this.systemUrl}/fetch-package`,);
    }

    public getParentMenuList() {
      return this.http.get(`${this.systemUrl}/fetch-parent-menu`,);
    }

    public addMenu(data:any): Observable<any> {
      return this.http.post(`${this.systemUrl}/create-menu-submenu`,data);
    }
    
    public getMenuTree() {
      return this.http.get(`${this.systemUrl}/fetch-menu-structure`,);
    }

    public getModuleByParentMenuID(parentMenuId:any): Observable<any> {
      return this.http.get(`${this.systemUrl}/fetch-submenu-based-on-parent-menu?parentMenuId=${parentMenuId}`);
    }

    public assignModuleIntoPackage(data:any): Observable<any> {
      return this.http.post(`${this.systemUrl}/assign-module-in-package`,data);
    }

    public getMenuByPackage(packageId:any) {
      return this.http.get(`${this.menuUrl}/fetch-menu?package_id=${packageId}`,);
    }

    public addRole(data:any): Observable<any> {
      return this.http.post(`${this.roleUrl}/role-create`,data);
    }

    public fetchRoles() {
      return this.http.get(`${this.roleUrl}/get-roles`,);
    }

    public addCompany(data:any): Observable<any> {
      return this.http.post(`${this.tenantsUrl}/create-tenant`,data);
    }

    public geCompanyList() {
      return this.http.get(`${this.tenantsUrl}/fetch-tenant`,);
    }

    public addUser(data:any): Observable<any> {
      return this.http.post(`${this.usersUrl}/user-create`,data);
    }

    public getUserByCompany(): Observable<any> {
      return this.http.get(`${this.usersUrl}/fetch-user`);
    }
  
}
