import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  private apiUrl = 'https://ticketapi.anudip.org/public/api/raiseticket';

  constructor(private http: HttpClient) {}

  public getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-category`);
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

}
