import { Component, Input } from '@angular/core';
import {Router} from '@angular/router';
import { Link } from './models/Link';
import {UserService} from "./services";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public router: Router, private userService: UserService) {}
  brand: Link = new Link('Lab Foursquare Integration', 'fa-search', null, '/', {});

  rightLinks: Link[] = [
    new Link('Login', 'fa-sign-in', null, '/login', {}, this.notLoggedIn, this.userService),
    new Link('Logout', 'fa-sign-out', null, '/logout', {}, this.isLoggedIn, this.userService),
  ];

  leftLinks: Link[] = [];

  isLoggedIn(userService: UserService) {
    return userService.isAuthenticated();
  }

  notLoggedIn(userService: UserService) {
    return !userService.isAuthenticated();
  }
}
