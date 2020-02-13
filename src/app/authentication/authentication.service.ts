import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { MSAdal, AuthenticationContext, AuthenticationResult } from '@ionic-enterprise/ms-adal/ngx';
import { Observable, from } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

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

  constructor(private platform: Platform, private msAdal: MSAdal) {
  }

  authenticate(): Observable<AuthenticationResult> {
    this.setUseBroker();

    return this.createAuthContext().pipe(
      switchMap(authContext => this.acquireTokenSilent(authContext, this.config).pipe(
        catchError(() => this.acquireToken(authContext, this.config))
      ))
    );
  }

  private setUseBroker(): void {
    const authenticationSettings = MSAdal.getPlugin().AuthenticationSettings;
    authenticationSettings.setUseBroker(true);
  }

  private createAuthContext(): Observable<AuthenticationContext> {
    return from(this.platform.ready()).pipe(
      map(() => this.msAdal.createAuthenticationContext(this.config.authority))
    );
  }

  private acquireTokenSilent(context: AuthenticationContext, config: AuthentcationConfig): Observable<AuthenticationResult> {
    return from(context.acquireTokenSilentAsync(config.resourceUri, config.appId, ''));
  }

  private acquireToken(context: AuthenticationContext, config: AuthentcationConfig): Observable<AuthenticationResult> {
    return from(context.acquireTokenAsync(config.resourceUri, config.appId, config.redirectUri, config.userId, ''));
  }
}
