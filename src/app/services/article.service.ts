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

  private makeArticleForm(article: Article): FormData {

    let form: FormData = new FormData();
    form.append('date', '');
    form.append('username', article.username);
    let message;
    if (article.message.type != 'text') {

      form.append('media', article.message.msgvalue, article.message.msgvalue.name);
      message = {
        _id: '',
        msgvalue: '',
        type: article.message.type
      };
    }
    else {
      message = {
        _id: '',
        msgvalue: article.message.msgvalue,
        type: article.message.type
      };
;
    }
    form.append('message', JSON.stringify(message));

    return form;

  }

  getArticles(page: number): Observable<any> {

    const httpheaders: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${sessionStorage.getItem('token')}`
    });

    return this.httpclient.get<any>(this.url + `/${page}`, { headers: httpheaders });

  }

  getMedia(id: string): Observable<Blob> {

    const httpheaders: HttpHeaders = new HttpHeaders({
      'Authorization': `${sessionStorage.getItem('token')}`
    });

    return this.httpclient.get(this.url + '/getmedia'+`/${id}`, { responseType:'blob', headers: httpheaders });

  }

  postArticle(article: Article): Observable<any> {

    const httpheaders: HttpHeaders = new HttpHeaders({
      'Authorization': `${sessionStorage.getItem('token')}`
    });

    return this.httpclient.post<any>(this.url + '/postarticle', this.makeArticleForm(article), { headers: httpheaders });

  }

  putArticle(article: Article): Observable<any> {

    const httpheaders: HttpHeaders = new HttpHeaders({
      "Content-Type": "multipart/form-data; boundary = AaB03x ",
      'Authorization': `${sessionStorage.getItem('token')}`
    });

    return this.httpclient.post(this.url + '/putarticle', JSON.stringify(article), { headers: httpheaders });

  }

  deleteArticle(id: string): Observable<any> {

    const httpheaders: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${sessionStorage.getItem('token')}`
    });

    return this.httpclient.delete(this.url + `/deletearticle/${id}`, { observe: 'body', headers: httpheaders });

  }

}
