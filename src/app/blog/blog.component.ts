import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { edit } from '@cloudinary/url-gen/actions/animated';
import { from, fromEvent, of, Subscription } from 'rxjs';
import { map, filter, switchMap, exhaustMap, concatMap } from 'rxjs/operators'
import { Article } from '../models/article';
import { Imessage } from '../models/Imessage';
import { MediaMessage } from '../models/media';
import { TextMessage } from '../models/text';
import { ArticleService } from '../services/article.service';
import { ValidatorService } from '../services/validator.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit, AfterViewInit, OnDestroy {
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

  curuser: string|null;
  curtoken: string|null;
  articles: Article[];
  article: Article;
  editarticle: Article;
  temptext: any;
  page: number = 0;
  countofpage: number = 0;
  textarea: string = '';
  file: any;
  isEdit: boolean[];
  curindex: number = -1;
  mediaUrls: Map<string, string> = new Map();
  ids: string[] = new Array();
  urls: string[] = new Array();

  constructor(
    private router: Router,
    private articleserv: ArticleService,
    private validatorserv: ValidatorService) {

    this.curuser = sessionStorage.getItem('user');
    this.curtoken = sessionStorage.getItem('token');
    if (this.curuser == null || this.curtoken == null) {

      this.router.navigate(['']);

    }

    this.articles = new Array();
    this.article = this.initArticle();
    this.editarticle = this.initArticle();
    this.isEdit = new Array();

    
  }

  ngOnInit() {
    this.getArticles(1);

  }

  ngAfterViewInit() {

    this.editarticle = this.initArticle();
    this.resetClick$ = fromEvent(this.resetBut, 'click').subscribe({
      next: (() => {
        this.article = this.initArticle();
        this.textarea = '';
        this.fileBut.value = '';
        this.file = undefined;
      }),
      error: ((e) => {

        console.error(e.error);

      })
    });


    this.fileClick$ = fromEvent(this.fileBut, 'change').pipe(

      map(() => {
        if (this.fileBut.files != null &&
          (this.fileBut.files[0]!.type == `image/png` ||
          this.fileBut.files[0]!.type == `image/jpeg` ||
          this.fileBut.files[0]!.type == `image/jpg` ||
          this.fileBut.files[0]!.type == `video/mp4` ||
          this.fileBut.files[0]!.type == 'video/mpeg' ||
          this.fileBut.files[0]!.type == 'video/x-msvideo' ||
          this.fileBut.files[0]!.type == 'audio/mpeg' ||
          this.fileBut.files[0]!.type == 'audio/wav' ||
          this.fileBut.files[0]!.type == 'audio/aac' ||
          this.fileBut.files[0]!.type == 'video/webm')) {

          console.log(this.fileBut.files[0]);
          return this.fileBut.files[0];
        }
        
        alert('Select file with correct type');
        this.fileBut.value = '';
        return null;

      }),
      filter(value => value != null),

      map(value => this.file = value)

    ).subscribe({
      next: (() => {
        console.log('File ready to upload!');
      }),
      error:((e)=> {

        console.error(e);
        alert(e.message);

      })
    });

  }

  ngOnDestroy() {

    this.postClick$?.unsubscribe();
    this.resetClick$?.unsubscribe();
    this.fileClick$?.unsubscribe();

  }

  getArticles(page:number) {

    this.articleserv.getArticles(page).pipe(

      map((data) => {
        this.articles = data.articles;
        if (this.countofpage != data.counts) {
          this.countofpage = data.counts;
          this.addPage();
        }

        this.articles.forEach(a => {

          this.isEdit.push(false);

        })
      }),
      exhaustMap(() => from(this.articles)),
      filter(art => art.message._id!=''),
      concatMap(art => this.articleserv.getMedia(art.message._id).pipe(
        map(value => {

          this.mediaUrls.set(art._id, window.URL.createObjectURL(value));
          
        })
      )),

    ).subscribe({
      next: (data => {

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

    return new Article(
      "",
      new Date(),
      { _id: "", msgvalue: "", type: "" },
      this.curuser as string);

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

  postClick() {

    if (this.textarea!='') {

      this.article.message = new TextMessage('', this.textarea, 'text');

    }
    else {

      if (this.file) {
        this.article.message = new MediaMessage('', this.file, 'media');

      } else {
        alert('Write text or select file');
        return ;
      }

    }

    this.articleserv.postArticle(this.article).subscribe({

      next: ((data) => {

        this.articles.push(new Article(data._id, data.date, data.message, data.username));
        if (this.countofpage != data.counts) {
          this.countofpage = data.counts;
          this.addPage();

        }
        if (data.message.type != 'text') {

          this.mediaUrls.set(data._id, window.URL.createObjectURL(this.file));
          this.file = undefined;

        }
        alert('Successfull create');

      }),
      error: ((e) => {

        console.error(e);
        alert(e.error);

      })
    });

  }

  updateClick(editarticle: Article, index: number) {

    if (this.editarticle?._id == '') {

      this.editarticle = Object.assign({}, editarticle);

      this.temptext = this.articles[index].message.msgvalue;
      this.isEdit[index] = true;
      this.curindex = index;

    }
    else {

      if (this.editarticle._id == editarticle._id) {

        if (this.validatorserv.messageValidate(this.editarticle.message)) {
          this.articleserv.putArticle(this.editarticle).subscribe({
            next: ((data: Article) => {

              let index: number = this.articles.findIndex(a => a._id == data._id);
              this.articles.splice(index, 1, data);

              if (data.message.type != 'text') {

                this.mediaUrls.set(data._id, window.URL.createObjectURL(this.file));
                this.file = undefined;
              }
              this.isEdit[index] = false;
              this.editarticle = this.initArticle();
              this.curindex = -1;

              alert('Successful update');

            }),
            error: ((e) => {

              console.error(e);
              alert(e.message);

            })
          });
        }
        else {

          alert('Incorrect value');

        }


      }
      else {

        this.isEdit[this.curindex] = false;
        this.isEdit[index] = true;

        this.editarticle = Object.assign({}, editarticle);

      }

    }
    
  }

  cancelClick(editarticle: Article, index: number, event: Event) {

    if (this.editarticle != undefined) {

      if (this.editarticle?._id == editarticle._id) {
        //console.log(this.editarticle.message.msgvalue);
        //console.log(editarticle.message.msgvalue);
        //console.log(this.temptext);
        //this.editarticle.message.msgvalue = this.temparticle.message.msgvalue;
        //editarticle.message.msgvalue = this.temparticle.message.msgvalue;
        this.articles[index].message.msgvalue = this.temptext;
        this.editarticle = this.initArticle();
        this.isEdit[index] = false;
        this.curindex = -1;
        console.log(event);
        if (this.temptext=="") {
          

        } 
      }

    }

  }

  deleteClick(editarticle: Article, index: number) {

    this.articleserv.deleteArticle(editarticle._id).subscribe({
      next: (() => {

        if (this.articles[index].message.type != 'text') {

          this.mediaUrls.delete(this.articles[index]._id);

        }
        this.articles.splice(index, 1);
        alert('Succesful delete');
        console.log('delete');
        this.editarticle = this.initArticle();
        this.file = undefined;
      }),
      error: ((e) => {

        console.log(e);
        alert(`${e.message}`);

      })
    })

  }

  editArticleSelect(event: Event) {
    console.log('edit event');
    const selector = event.target as HTMLInputElement;

    if (selector.files != null &&
      (selector.files[0]!.type == `image/png` ||
      selector.files[0]!.type == `image/jpeg` ||
      selector.files[0]!.type == `image/jpg` ||
      selector.files[0]!.type == `video/mp4` ||
      selector.files[0]!.type == 'video/mpeg' ||
      selector.files[0]!.type == 'video/x-msvideo' ||
      selector.files[0]!.type == 'audio/mpeg' ||
      selector.files[0]!.type == 'audio/wav' ||
      selector.files[0]!.type == 'audio/aac' ||
      selector.files[0]!.type == 'video/webm')) {

      this.file = selector.files[0];
      this.editarticle.message.msgvalue = this.file;
      console.log(this.editarticle);
    }
    else {
      console.error('Incorrect type');
      alert("Incoorect type");
      selector.value = '';
      return;
    }

  }

}
