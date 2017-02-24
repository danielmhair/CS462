import {Routes} from "@angular/router";
import {LoginComponent} from "./login/login.component";
import {LoggedInGuard} from "./models/logged-in.guard";
import {LogoutComponent} from "./logout/logout.component";

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent, canActivate: [LoggedInGuard] }
];
