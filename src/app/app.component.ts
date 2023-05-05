import { Component, AfterViewInit, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, Observable, fromEvent } from 'rxjs';
import { UsersService } from './services/users.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('logoutbut')
  private logoutbut: ElementRef | undefined;

  logoutCLick$: Subscription | undefined;

  title = 'blog_app_front';

  constructor(private userserv: UsersService, private router: Router) {


  }

  ngOnDestroy(): void {

    this.logoutCLick$?.unsubscribe();

  }

  ngAfterViewInit(): void {

    this.logoutCLick$ = fromEvent(this.logoutBut, 'click').subscribe({
      next: (() => {

        this.userserv.logoutUser();
        this.router.navigate(['/login'])

      }
      )
    });

  }

  public get logoutBut(): HTMLButtonElement {

    return this.logoutbut?.nativeElement;

  }

}
