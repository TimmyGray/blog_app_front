import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private url: string = environment.appUrl + '/users';

  constructor(private httpclient: HttpClient) { }

  loginUser(user: User): Observable<any> {

    const httpheaders: HttpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    return this.httpclient.post(this.url + '/login', JSON.stringify(user), { observe: "body", responseType: 'json', headers: httpheaders });

  }

  registerUser(user: User):Observable<boolean> {

    const httpheaders: HttpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    return this.httpclient.post(this.url + '/register', JSON.stringify(user), { observe: 'body', responseType:'json', headers: httpheaders }).pipe(

      map((res:any) => {

        sessionStorage.setItem('user', user.login);
        sessionStorage.setItem('token', res.token);
        return true;

      })

    );


  }

  logoutUser() {

    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');

  }

}
