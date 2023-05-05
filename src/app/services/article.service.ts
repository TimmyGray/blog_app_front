import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from '../models/article';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private url: string = environment.appUrl + '/articles';
  constructor(private httpclient: HttpClient) { }

  getArticles(page: number): Observable<any> {

    const httpheaders: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `${sessionStorage.getItem('token')}` });
    return this.httpclient.get<any>(this.url + `/${page}`, { headers: httpheaders });

  }

  postArticles(article: Article): Observable<any> {

    const httpheaders: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `${sessionStorage.getItem('token')}` });
    return this.httpclient.post<any>(this.url+'/postarticle', JSON.stringify(article), { headers: httpheaders });

  }

}
