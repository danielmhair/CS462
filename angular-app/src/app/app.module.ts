import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';

// Angular Material 2 Modules
import { MaterialModule } from '@angular/material';
import 'hammerjs';

// Routes
import {routes} from './app.routes';

// Components
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { IconComponent } from './icon/icon.component'
import { DmhButtonIconComponent } from './dmh-button-icon/dmh-button-icon.component'
// Services
import { UserService } from './services';
import { AuthHttp } from './services/auth-http.service';
import {LoggedInGuard} from "./models/logged-in.guard";

export function newHttpService(backend: XHRBackend, defaultOptions: RequestOptions) {
  return new AuthHttp(backend, defaultOptions);
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    PageNotFoundComponent,
    LoginComponent,
    LogoutComponent,
    IconComponent,
    DmhButtonIconComponent,
],
  imports: [
    BrowserModule,
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    MaterialModule.forRoot(),
  ],
  providers: [
    LoggedInGuard,
    { provide: UserService, useClass: UserService },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: Http,
      useFactory: newHttpService,
      deps: [ XHRBackend, RequestOptions]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
