import {Component, OnInit, Input} from '@angular/core';
import {AbstractControl, FormGroup, FormBuilder} from "@angular/forms";
import {UserService} from "../services/user.service";
import { RumorsObservable } from "../services/rumors.service";
import {Rumor} from "app/models/Rumor";

@Component({
  selector: 'rumors',
  templateUrl: './rumors.component.html',
  styleUrls: ['./rumors.component.scss'],
})
export class RumorsComponent implements OnInit {
  rumorsForm: FormGroup;
  message: AbstractControl;
  messageVal: string;
  error: any = null;

  constructor(private fb: FormBuilder, private rumorsResult: RumorsObservable, private userService: UserService) {}

  ngOnInit() {
    this.rumorsForm = this.fb.group({
      'message': [""],
    });

    this.message = this.rumorsForm.controls['message'];
    this.message.valueChanges
    .subscribe((listenerStr: string) => this.messageVal = listenerStr);
  }

  sendMessage() {
    if (this.messageVal) {
      this.rumorsResult.createRumor(this.messageVal)
      .subscribe(
        (rumor: Rumor) => {
          console.log("Created rumor");
          console.log(rumor);
          this.message.reset("");
        },
        err => {
          console.error(err.json().message);
          this.error = "Message from Server: " + err.json().message;
        }
      );
    }
  }
}
