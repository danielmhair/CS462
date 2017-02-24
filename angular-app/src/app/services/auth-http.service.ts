import { Injectable } from '@angular/core';
import { Http, ConnectionBackend, Request, RequestOptionsArgs, RequestOptions, Response} from '@angular/http';
import { Observable } from 'rxjs';
import {authHeader} from "app/models/XHRHeader";
@Injectable()
export class AuthHttp extends Http {

  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    console.log(url);
    return super.request(url, options);
  }

  /**
   * Get resource to fetch data from server using an end point as `url`
   */
  get(url: string) {
    return super.get(url, authHeader());
  }

  /**
   *
   * Post resource to send a post request to the server.
   * Extracts the current token from the local storage else redirects to
   * session expired modal.
   */
  post(url: string, body: any) {
    return super.post(url, JSON.stringify(body), authHeader());
  }

  /**
   *
   * Updates a resource to send a put request to the server.
   * Extracts the current token from the local storage else redirects to
   * session expired modal.
   */
  put(url: string, body: any) {
    return super.put(url, JSON.stringify(body), authHeader());
  }


  /**
   * Delete a resource to fetch data from server using an end point as `url`
   */
  delete(url: string) {
    return super.delete(url, authHeader(false));
  }
}
