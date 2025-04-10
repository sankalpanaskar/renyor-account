import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  // private apiUrl = 'https://ticketapi.anudip.org/public/api/raiseticket';
  private apiUrl= environment.apiBaseUrl+ 'api';


  constructor(private http: HttpClient) {}

  public getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-degree`);
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

}
