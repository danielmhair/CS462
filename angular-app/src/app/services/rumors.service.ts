import { Injectable } from "@angular/core";
import {BehaviorSubject, Observable, ReplaySubject, Subject} from "rxjs";
import {UserService} from "./user.service";
import {Http} from "@angular/http";
import {Constants} from "../models/Constants";
import {User} from "../models/User";
import {Rumor} from "../models/Rumor";
import {IRumorOperation} from "../models/IRumorOperation";

@Injectable()
export class RumorsObservable extends BehaviorSubject<Rumor[]> {
  public rumors: Rumor[];
  public ready: boolean = false;
  public loading: boolean = false;
  private user: User = null;

  private updates: ReplaySubject<IRumorOperation> = new ReplaySubject<IRumorOperation>();
  private rumorsStream: Observable<Rumor[]>;
  private createStream: Subject<Rumor> = new Subject<Rumor>();
  private deleteStream: Subject<Rumor> = new Subject<Rumor>();
  private resetStream: Subject<Rumor> = new Subject<Rumor>();
  private updateStream: Subject<Rumor> = new Subject<Rumor>();
  private emptyRumor: Rumor;

  constructor(private http: Http, private userService: UserService) {
    super(null);

    this.rumorsStream = this.updates
    .scan((categories: Rumor[], operation: IRumorOperation) => {
      return operation(categories);
    }, []);

    console.log(Rumor);
    this.emptyRumor = new Rumor('', '', '');

    this.createStream
    .map((newRumor: Rumor) => {
      return (curRumors: Rumor[]) => {
        return curRumors.concat(newRumor)
      };
    })
    .subscribe(this.updates);

    this.updateStream
    .map((rumorToUpdate: Rumor) => {
      console.log('returning updateStream function...');
      return (curRumors: Rumor[]) => {
        return curRumors.map((rumor: Rumor) => {
          if (rumor.messageId == rumorToUpdate.messageId) {
            return rumorToUpdate;
          }
          return rumor;
        })
      }
    })
    .subscribe(this.updates);

    this.deleteStream
    .map((rumor: Rumor) => {
      return (curRumors: Rumor[]) => {
        console.log('Deleting a category via stream.');
        return curRumors.filter(nextRumor => {
          return nextRumor.messageId !== rumor.messageId;
        });
      }
    })
    .subscribe(this.updates);

    this.resetStream
    .map((rumor: Rumor) => {
      return (curRumors: Rumor[]) => {
        console.log('Resetting all rumors via stream.');
        return [];
      }
    })
    .subscribe(this.updates);

    this.rumorsStream.subscribe(rumors => {
        this.rumors = rumors;
        super.next(this.rumors);
        console.log("Rumors list");
        console.log(rumors);
      },
      err => super.error(err),
    () => super.complete());

    this.userService.userStream
    .subscribe((user: User) => {
      this.user = user;
      if (this.user) {
        this.loadAll();
      }
    });
  }

  resetRumors() {
    this.resetStream.next(this.emptyRumor)
  }

  createRumor(message: string) {
    return new Observable(observer => {
      console.log('Creating a Rumor.');
      console.log(message);
      if (this.userService.isAuthenticated()) {
        this.loading = true;
        this.http.post(`${Constants.USER_API}/${this.user._id}/rumors`, {
          message: message
        })
        .map(res => res.json())
        .subscribe(
          (rumor: Rumor) => {
            console.log('Created new rumor');
            console.log(rumor);
            this.loading = false;
            this.createStream.next(rumor);
            observer.next(rumor)
          },
          err => {
            this.loading = false;
            console.error(err);
            observer.error(err);
          }
        );
      }
    })
  }

  public loadAll(): void {
    console.log('Loading current rumors');
    if (!this.userService.isAuthenticated()) {
      console.error('User not authenticated');
      this.resetRumors();
      return;
    }

    if (this.user) {
      this.loading = true;
      this.http.get(`${Constants.USER_API}/${this.user._id}/rumors`)
      .map(res => res.json())
      .subscribe(
        (rumors: Rumor[]) => { // on success
          console.log("Rumors receieved");
          console.log(rumors);
          this.resetRumors();
          this.ready = true;
          this.loading = false;
          rumors.forEach(rumor => {
            this.createStream.next(rumor);
          });
        },
        (err: any) => {
          console.log(err);
          this.loading = false;
        }
      );
    } else {
      console.error("User does not exist");
      this.ready = true;
      this.loading = false;
    }
  }
}
