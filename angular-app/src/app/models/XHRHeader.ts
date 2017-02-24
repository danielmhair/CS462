import {  Headers, RequestOptions } from '@angular/http';

export function authHeader(useJson: boolean = true) {
  let headers = new Headers();
  if (useJson) {
    headers.append('Content-Type', 'application/json');
  }
  let access_token = localStorage.getItem("access_token");
  if (access_token) {
    headers.append('Authorization', `Bearer ${access_token}`);
  }
  return new RequestOptions({ headers: headers });
}
