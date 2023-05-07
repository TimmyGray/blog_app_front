import { Component, AfterViewInit,ViewChild,ElementRef,OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgModel } from '@angular/forms';
import { fromEvent, Observable, Subscription } from "rxjs";
import { map, exhaustMap, filter } from 'rxjs/operators';
import { User } from '../models/user';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('regbut')
  private regbut: ElementRef | undefined;

  @ViewChild('resetbut')
  private resetbut: ElementRef | undefined;

  resetClick$: Subscription | undefined;

  user: User;
  confirmpass: string = '';

  constructor(private userserv: UsersService, private router: Router) {

    this.user = this.initUser();

  }
  ngOnDestroy(): void {

    this.resetClick$?.unsubscribe();

  }

  ngAfterViewInit(): void {

    this.resetClick$ = fromEvent(this.resetBut, 'click').subscribe({
      next: (() => {

        this.user = this.initUser();
        this.confirmpass = '';

      })
    });

  }

  private initUser(): User {

    return new User('', '', '', '');

  }

  public get regBut(): HTMLButtonElement {

    return this.regbut?.nativeElement;

  }

  public get resetBut(): HTMLButtonElement {

    return this.resetbut?.nativeElement;

  }

  registerClick() {

    if (this.user.password != this.confirmpass) {
      alert('Password and Confirm password must be the same');
      return;
    }
    this.userserv.registerUser(this.user).subscribe({
      next: (() => {

        console.log('Register successful');
        this.router.navigate(['']);

      }),
      error: ((e) => {

        console.error(e);
        alert(`Register failed: ${e.error}`);

      })
    });

  }

}
