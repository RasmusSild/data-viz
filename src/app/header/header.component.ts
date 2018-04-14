import {AfterViewInit, Component, OnInit} from '@angular/core';
import { Router, NavigationEnd, Event as NavigationEvent } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit {

  homeActive: boolean;
  editorActive: boolean;
  demoActive: boolean;
  helpActive: boolean;

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    let url = "";
    this.router.events.forEach((event: NavigationEvent) => {
      if (event instanceof NavigationEnd) {
        url = event.url;
        if (url.length === 1) {
          this.homeActive = true;
          this.editorActive = false;
        }
        if (url.length === 4) {
          this.homeActive = false;
          this.editorActive = true;
        }
      }
    });
  }

}
