import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
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
  editarticle: Article | undefined;
  page: number = 0;
  countofpage: number = 0;
  textarea: string = '';
  file: any;
  isEdit: boolean[];
  curindex: number = -1;
  mediaUrls: Map<string, string> = new Map();
  ids: string[] = new Array();
  urls: string[] = new Array();
  medias: Blob[] = new Array();

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

    this.postClick$ = fromEvent(this.postBut, 'click').pipe(
      map(() => {
        if (this.textarea != '') {
          
          this.article.message = new TextMessage('', this.textarea,'text');
          return true;
        }
        else {
          if (this.file) {
            this.article.message = new MediaMessage('', this.file,'media');
            return true;
          }
        }
        return false;
      }),
      filter(valid=>valid==true),
      exhaustMap(() => this.articleserv.postArticle(this.article))
    ).subscribe({

      next: ((data) => {

        this.articles.push(new Article(data._id, data.date, data.message, data.username));
        if (this.countofpage!=data.counts) {
          this.addPage();

        }

      }),
      error: ((e) => {

        console.error(e);
        alert(e.error);

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
      exhaustMap(() => from(this.articles).pipe(
        filter(value => value.message._id != ''),
        map(value => {

          this.ids.push(value._id)
          console.log(value._id);
          return value;

        })

      )),

      concatMap(value => this.articleserv.getMedia(value.message._id).pipe(
        map(value => this.medias.push(value))
      )),
      exhaustMap(() => of(this.medias))

    ).subscribe({
      next: (data => {

        for (var i = 0; i < this.medias.length; i++) {

          let url = window.URL.createObjectURL(data[i]);
          this.urls.push(url);


          //let reader = new FileReader();
          //reader.readAsDataURL(data[i]);
          //reader.onload = () => {
          //  let url = reader.result as string;
          //  this.urls.push(url);
          //}

          //reader.onerror = (e) => {
          //  console.error(e);
          //  alert(e);
          //}

        }

        this.concatIdWithUrl();
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

  //messageToText(message: Imessage): string {

  //  return (message as TextMessage).text;

  //}

  updateClick(editarticle: Article, index: number) {

    if (this.editarticle != undefined) {

      if (this.editarticle?._id == '') {

        this.editarticle = Object.assign({}, editarticle);
        this.isEdit[index] = true;
        this.curindex = index;

      }
      else {

        if (this.editarticle._id == editarticle._id) {

          if (this.validatorserv.messageValidate(editarticle.message)) {
            this.articleserv.putArticle(editarticle).subscribe({
              next: ((data) => {

                let index: number = this.articles.findIndex(a => a._id == editarticle._id);
                this.articles.splice(index, 1, editarticle);
                this.isEdit[index] = false;
                this.editarticle = this.initArticle();
                this.curindex = -1;

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
    
    
  }

  cancelClick(editartcle: Article, index: number) {

    if (this.editarticle != undefined) {

      if (this.editarticle?._id == editartcle._id) {

        this.isEdit[index] = false;
        this.editarticle = this.initArticle();
        this.curindex = -1;

      }

    }

  }

  deleteClick(editarticle: Article, index: number) {

    let ind: number = this.articles.findIndex(a => a._id == editarticle._id);
    this.articleserv.deleteArticle(editarticle._id).subscribe({
      next: (() => {

        this.articles.splice(ind, 1);
        alert('Succesful delete');
        console.log('delete');
      }),
      error: ((e) => {

        console.log(e);
        alert(e.message);

      })
    })


  }

  private concatIdWithUrl(){

    for (let i = 0; i < this.ids.length;i++) {

      this.mediaUrls.set(this.ids[i], this.urls[i]);

    }

  }

  displayMedia(article: Article) {

    return this.mediaUrls.get(article._id);
    //this.articleserv.getMedia(message._id).subscribe({
    //  next: ((data) => {

    //    let filereader = new FileReader();
    //    filereader.readAsDataURL(data);

    //    filereader.onload = (() => {

    //      return filereader.result as string;

    //    });

    //    filereader.onerror = (e) => {

    //      console.error(e);
    //      alert(e);

    //    }

    //  }),
    //  error: (e => {

    //    console.error(e);
    //    alert(e.message);

    //  })

    //});


  }

}
