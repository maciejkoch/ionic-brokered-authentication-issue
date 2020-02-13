import { Component, OnInit } from '@angular/core';
import { AuthenticationResult } from '@ionic-enterprise/ms-adal/ngx';
import { Observable, Subject, EMPTY } from 'rxjs';

import { AuthenticationService } from '../authentication/authentication.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  info$: Observable<AuthenticationResult>;
  error$: Subject<any> = new Subject();

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.info$ = this.authenticationService.authenticate().pipe(
      catchError(error => {
        this.error$.next(error);
        this.error$.complete();
        return EMPTY;
      })
    );
  }
}
