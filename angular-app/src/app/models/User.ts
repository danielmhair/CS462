import { Rumor } from './Rumor';

export class User {
  _id: string;
  google_id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  foursquare: any;
  google: any;
  twitter: any;
  facebook: any;

  nodeEndpoint: string;
  uuid: string;
  neighbors: string[];
  rumors: Rumor[];
  seed: boolean;

  constructor(username: string, first_name?: string, last_name?: string, role?: string, google_id?: string, id?: string) {
    this._id = id ? id : null;
    this.google_id = google_id ? google_id : null;
    this.username = username ? username : null;
    this.first_name = first_name ? first_name : null;
    this.last_name = last_name ? last_name : null;
    this.role = role ? role : 'user';
  }
}
