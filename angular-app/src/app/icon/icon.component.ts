import { Component, Input } from '@angular/core';

@Component({
  selector: 'icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.css']
})
export class IconComponent {
  @Input() name: string;
  @Input() size: string;

  constructor() { }

  contains(sub: string) {
    return this.name.indexOf(sub) >= 0;
  }

}