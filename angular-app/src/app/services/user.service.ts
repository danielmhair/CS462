import { Injectable } from '@angular/core';
import {User} from '../models/User';
import {Constants} from '../models/Constants';
import {Router} from '@angular/router';
import {Observable, BehaviorSubject} from 'rxjs';
import {Http, Response} from "@angular/http";

@Injectable()
export class UserService {
  public user: User;
  public loading: boolean = false;
  public userStream: BehaviorSubject<User> = new BehaviorSubject(null);
  public usersStream: BehaviorSubject<User[]> = new BehaviorSubject(null);

  constructor(private http: Http, private router: Router) {
    this.userStream
    .subscribe(
      (user: User) => {
        console.log(user);
        this.user = user
      },
      err => console.error(err)
    );
  }

  public getCurrentUsername() {
    return localStorage.getItem('username');
  }

  public getUser() {
    this.loading = true;
    let username = this.getCurrentUsername();
    if (!username) {
      console.log('Has username?', username);
      this.userStream.error('User is not authenticated');
      return;
    }
    this.http.get(`${Constants.USER_API}/${username}`)
    .map(res => res.json())
    .subscribe(
      (user: User) => {
        this.loading = false;
        console.log(user);
        this.userStream.next(user);
        console.log(user.foursquare.token);
        this.getCheckins(user._id, user.foursquare.token);
        this.getAll();
      },
      err => {
        this.loading = false;
        this.userStream.error(err)
      }
    );
  }

  public getAll() {
    this.http.get(`${Constants.USER_API}`)
    .map(res => res.json())
    .subscribe(
      users => this.usersStream.next(users),
      err => this.usersStream.error(err)
    )
  }

  public getCheckins(id: string, token: string) {
    this.http.get(`${Constants.USER_API}/${id}/account?token=${token}`)
    .map(res => res.json())
    .subscribe(
      response => {
        this.userStream.next(response.user);
        console.log(response)
      },
      err => {
        console.error(err)
      }
    )
  }

  public isAuthenticated() {
    const tokenExpired = this.tokenExpired();
    if (tokenExpired) {
      localStorage.clear();
    }

    return !tokenExpired;
  }

  /**
   *
   * This function checks if the current token of the app has been expired
   * based on the first time authentication from server
   */
  private tokenExpired() {
    let expiryTime = Number(localStorage.getItem('token_age'));
    let curTime = Math.floor(new Date().getTime() / 1000);
    return curTime > expiryTime;
  }

  private loginUrls: Object = {
    'google': Constants.GOOGLE_LOGIN,
    'foursquare': Constants.FOURSQUARE_LOGIN,
    'facebook': Constants.FACEBOOK_LOGIN,
    'twitter': Constants.TWITTER_LOGIN,
  };

  /**
   * Sends a login request
   *
   */
  public login(type: string = 'foursquare') {
    console.log("Logging in...");
    if (!this.loginUrls[type]) {
      let supportedTypes = Object.keys(this.loginUrls);
      return Observable.throw(`Login Type is not supported. Types supported ${supportedTypes}`);
    }

    console.log("Logging in via " + this.loginUrls[type]);
    window.location.href = this.loginUrls[type]
  }

  /**
   * Logout method to send a logout request to the server and clear localStorage
   */
  public logout() {
    localStorage.clear();
    this.userStream.next(null);
    this.router.navigate(['/login', {loginMessage: "You have logged out!", intendedLogout: true}]);
  }

  public isAdmin() {
    return this.user && this.user.role == 'admin'
  }

  private extractToken(res: Response) {
    console.log("Extracting token...");
    let jsonResp = res.json();
    if (res.status === 200) {
      let token = jsonResp.token;
      console.log(token);
      let tokenAge = jsonResp.expires_in;
      console.log(tokenAge);
      const expirationTime = Math.floor(new Date().getTime() / 1000) + Number(tokenAge);
      localStorage.setItem('token', token);
      localStorage.setItem('token_age', String(expirationTime));
    }
  }

  private handleError(error: any) {
    return Observable.throw(error);
  }

  /**
   *
   * On logout, clear the local storage and redirect to login page
   */
  private handleLogout(data: Response) {
    if (data.status === 200) {
      localStorage.clear();
      this.router.navigate(['/login', { loginMessage: "You have successfully logged out!", intendedLogout: true}]);
    }
  }
}
