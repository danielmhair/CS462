import {Component, OnInit} from '@angular/core';
import { UserService } from '../services';
import { User } from '../models/User';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { LoginAnimations } from './login.animation';
import { Constants } from '../models/Constants';

@Component({
  selector: `login`,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: LoginAnimations
})
export class LoginComponent implements OnInit {
  model: User = new User('');
  loading: boolean = false;
  success: boolean = false;
  loginMessage: string = '';
  intendedLogout: string = '';
  loggedIn: boolean = false;
  user: User = null;
  users: User[] = null;

  constructor(private userService: UserService,
              private route: ActivatedRoute) {}

  public ngOnInit() {
    this.userService.userStream.subscribe(
      (user: User) => {
        console.log(user);
        this.user = user
      }
    );
    this.userService.usersStream.subscribe(
      (users: User[]) => {
        console.log(users);
        this.users = users
      }
    );
    this.route.params.subscribe(params => {
      console.log(params);
      this.loginMessage = params['loginMessage'];
      this.intendedLogout = params['intendedLogout'];

      // 1. Check params from login
      if (params['token'] && params['age'] && params['username']) {
        console.log('Received login info');
        localStorage.setItem('token', params['token']);
        const expirationTime = this.getExpiration(params['age']);
        this.loggedIn = true;
        localStorage.setItem('token_age', expirationTime + '');
        localStorage.setItem('username', params['username']);
        this.userService.getUser();
      } else {
        this.loggedIn = false;
        this.userService.getAll();
      }
    });
  }

  public getUserInfo(user: User) {
    this.userService.getCheckins(user._id, (this.user && this.user._id == user._id) ? user.foursquare.token : null)
  }

  public getExpiration(token_age) {
    // return Math.floor(new Date().getTime() / 1000) + Number(token_age);
    return Number(token_age);
  }

  public loginWith(type: string) {
    console.log("LOGGING IN WITH " + type);
    this.userService.login(type);
  }

  private handleError(error: any) {
    this.loading = false;
    this.success = true;
    error = error.json();
    console.error(error); // log to console instead
    return Observable.throw(error);
  }
}
