import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { map, filter, switchMap, exhaustMap } from 'rxjs/operators'
import { Article } from '../models/article';
import { Imessage } from '../models/Imessage';
import { MediaMessage } from '../models/media';
import { TextMessage } from '../models/text';
import { ArticleService } from '../services/article.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit, AfterViewInit {
  @ViewChild('postbut')
  private postbut: ElementRef | undefined;

  @ViewChild('filebut')
  private filebut: ElementRef | undefined;

  @ViewChild('resetbut')
  private resetbut: ElementRef | undefined;

  @ViewChild('pagesrow')
  private pagesrow: ElementRef | undefined;

  fileClick$: Subscription | undefined;
  resetClick$: Subscription | undefined;
  postClick$: Subscription | undefined;

  private curuser: string|null;
  private curtoken: string|null;
  articles: Article[];
  article: Article;
  page: number = 0;
  countofpage: number = 0;
  textarea: string = '';
  file: any;

  constructor(private router: Router, private articleserv: ArticleService) {

    this.curuser = sessionStorage.getItem('user');
    this.curtoken = sessionStorage.getItem('token');
    if (this.curuser == null || this.curtoken == null) {

      this.router.navigate(['']);

    }

    this.articles = new Array();
    this.article = this.initArticle();
    

    
  }

  ngOnInit() {

    this.getArticles(1);

  }

  ngAfterViewInit() {

    this.resetClick$ = fromEvent(this.resetBut, 'click').subscribe({
      next: (() => {
        this.article = this.initArticle();
        this.textarea = '';
        this.fileBut.value = '';
      }),
      error: ((e) => {

        console.error(e.error);

      })
    });

    this.postClick$ = fromEvent(this.postBut, 'click').pipe(
      map(() => {
        if (this.textarea != '') {
          this.article.message = new TextMessage('', this.textarea);
          return true;
        }
        else {
          if (this.file) {
            this.article.message = new MediaMessage('', this.file);
            return true;
          }
        }
        return false;
      }),
      filter(valid=>valid==true),
      exhaustMap(() => this.articleserv.postArticles(this.article))
    ).subscribe({

      next: ((data) => {

        this.articles.push(new Article(data._id, data.date, data.message, data.username));
        this.countofpage++;

      }),
      error: ((e) => {

        console.error(e);
        alert(e.error);

      })
    });

    this.addPage();

  }

  getArticles(page:number) {

    this.articleserv.getArticles(page).subscribe({
      next: (data => {

        this.articles = data.articles;
        if (this.countofpage!=data.counts) {
          this.countofpage = data.counts;
          this.addPage();
        }


      }),
      error: ((e) => {

        console.error(e);
        alert(e.error);

      })
    });

  }

  public get postBut(): HTMLButtonElement {

    return this.postbut?.nativeElement;

  }

  public get fileBut(): HTMLInputElement {

    return this.filebut?.nativeElement;

  }

  public get resetBut(): HTMLButtonElement {

    return this.resetbut?.nativeElement;

  }

  public get pagesRow(): HTMLElement {

    return this.pagesrow?.nativeElement;

  }

  private initArticle(): Article {

    return new Article("", new Date(), { _id: "" }, this.curuser as string);

  }

  private addPage() {

    this.pagesRow.innerHTML = '';
    for (var i = 0; i < this.countofpage; i++) {
      
      let page = document.createElement('a');
      page.textContent = `${i+1}`;
      page.classList.add('page','col-2');
      page.addEventListener('click', () => {
        this.getArticles(parseInt(page.textContent as string));
      })
      this.pagesRow.appendChild(page);

    }

  }

  messageToText(message: Imessage): string {

    return (message as TextMessage).text;

  }

}
