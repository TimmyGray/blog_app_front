import { Component, OnInit, ViewChild, AfterViewInit,OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { map, switchMap, exhaustMap, filter } from 'rxjs/operators';
import { User } from '../models/user';
import { UsersService } from "../services/users.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('logbut', { static: false })
  private logbut: ElementRef | undefined

  @ViewChild('resetbut', { static: false })
  private resetbut: ElementRef | undefined

  logClick$: Subscription | undefined;
  resetClick$: Subscription | undefined;

  user: User;


  constructor(private userserv: UsersService, private router: Router) {

    this.user = this.initUser();

  }
  ngOnDestroy(): void {

    this.logClick$?.unsubscribe();
    this.resetClick$?.unsubscribe();

  }

  ngAfterViewInit(): void {

    this.logClick$ = fromEvent(this.logBut, 'click').pipe(

      exhaustMap(() => this.userserv.loginUser(this.user))

    ).subscribe({

      error: ((e) => {

        console.error(e);
        alert(`Login failed: ${e.error}`);

      }),

      next: (() => {

        console.log('Login successful');
        this.router.navigate(['/blog']);

      })
    });


    this.resetClick$ = fromEvent(this.resetBut, 'click').subscribe({
      next: (() => {

        this.user = this.initUser();

      })
    });


  }

  private initUser():User {

    return new User('', '', '', '');

  }

  public get logBut(): HTMLButtonElement {

    return this.logbut?.nativeElement;

  }

  public get resetBut(): HTMLButtonElement {

    return this.resetbut?.nativeElement;

  }

}
