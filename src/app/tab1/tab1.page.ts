import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthenticationResult } from '@ionic-enterprise/ms-adal/ngx';
import { Observable, Subject, EMPTY } from 'rxjs';
import { catchError, shareReplay, tap, share } from 'rxjs/operators';

import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tab1Page implements OnInit {

  info$: Observable<AuthenticationResult>;
  error$: Subject<any> = new Subject();

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.info$ = this.authenticationService.info;
  }

  signIn(): void {
    this.authenticationService.signIn().pipe(
      catchError(error => this.handleError(error))
    ).subscribe();
  }

  signOut(): void {
    this.authenticationService.signOut().pipe(
      catchError(error => this.handleError(error))
    ).subscribe();
  }

  private handleError(error): Observable<any> {
    this.error$.next(error);
    this.error$.complete();
    return EMPTY;
  }
}
