import {Component, OnInit, ViewChild} from '@angular/core';
import {Link} from "../models/Link";
import {Input} from "@angular/core/src/metadata/directives";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @ViewChild('menuRight') menu: any;
  @Input() brand: Link;
  @Input() leftLinks: Link[];
  @Input() rightLinks: Link[];

  constructor() {}

  openMenu() {
    if (this.menu) {
      this.menu.open();
    }
  }
}
