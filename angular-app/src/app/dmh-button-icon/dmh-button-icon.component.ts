import { Component, Input } from '@angular/core';

@Component({
  selector: 'dmh-button-icon',
  templateUrl: './dmh-button-icon.component.html',
  styleUrls: ['./dmh-button-icon.component.css']
})
export class DmhButtonIconComponent {
  @Input() name: string;
  @Input() size: string;

  constructor() { }

  contains(sub: string) {
    return this.name.indexOf(sub) >= 0;
  }
}
