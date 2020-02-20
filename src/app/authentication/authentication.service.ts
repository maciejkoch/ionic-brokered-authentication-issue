import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { MSAdal, AuthenticationContext, AuthenticationResult } from '@ionic-enterprise/ms-adal/ngx';
import { InAppBrowser } from '@ionic-enterprise/inappbrowser/ngx';

import { Observable, from, Subject } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';

interface AuthentcationConfig {
  authority: string;
  appId: string;
  resourceUri: string;
  redirectUri: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  readonly config: AuthentcationConfig = {
    authority: '',
    appId: '', // application uder conditional access
    resourceUri: '',
    redirectUri: '', // x-msauth-{{my-app-id}}}}://my.app.id
    userId: ''
  };

  private info$: Subject<AuthenticationResult> = new Subject();

  get info(): Observable<AuthenticationResult> {
    return this.info$.asObservable();
  }
  constructor(private platform: Platform, private msAdal: MSAdal, private inAppBrowser: InAppBrowser) {
  }

  signIn(): Observable<AuthenticationResult> {
    if (this.platform.is('android')) {
      this.setUseBroker();
    }

    return this.createAuthContext(this.config).pipe(
      switchMap(authContext => this.acquireTokenSilent(authContext, this.config).pipe(
        catchError(() => this.acquireToken(authContext, this.config))
      )),
      tap(result => this.info$.next(result))
    );
  }

  signOut(): Observable<boolean> {
    const signOutUrl = `${this.config.authority}/oauth2/logout?post_logout_redirect_uri=${this.config.redirectUri}`;

    return this.createAuthContext(this.config).pipe(
      switchMap(authContext => authContext.tokenCache.clear()),
      map(() => {
        const browser = this.inAppBrowser.create(signOutUrl, '_blank', 'location=yes');
        browser.hide();
        return true;
      }),
      tap(() => this.info$.next(null))
    )
  }

  private setUseBroker(): void {
    const authenticationSettings = MSAdal.getPlugin().AuthenticationSettings;
    authenticationSettings.setUseBroker(true);
  }

  private createAuthContext(config: AuthentcationConfig): Observable<AuthenticationContext> {
    return from(this.platform.ready()).pipe(
      map(() => this.msAdal.createAuthenticationContext(config.authority))
    );
  }

  private acquireTokenSilent(context: AuthenticationContext, config: AuthentcationConfig): Observable<AuthenticationResult> {
    return from(context.acquireTokenSilentAsync(config.resourceUri, config.appId, config.userId));
  }

  private acquireToken(context: AuthenticationContext, config: AuthentcationConfig): Observable<AuthenticationResult> {
    return from(context.acquireTokenAsync(config.resourceUri, config.appId, config.redirectUri, config.userId, ''));
  }
}
