import { AfterViewInit, Component, isDevMode } from '@angular/core';
import { Router, NavigationEnd, Event as NavigationEvent } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements AfterViewInit {

  homeActive: boolean;
  editorActive: boolean;
  demoActive: boolean;
  helpActive: boolean;
  devMode = isDevMode();

  constructor(private router: Router) {
  }

  ngAfterViewInit() {
    let url = '';
    this.router.events.forEach((event: NavigationEvent) => {
      if (event instanceof NavigationEnd) {
        url = event.url;
        if (url.length === 1) {
          this.homeActive = true;
          this.editorActive = this.demoActive = this.helpActive = false;
        }
        if (url.indexOf('/new') >= 0) {
          this.editorActive = true;
          this.homeActive = this.demoActive = this.helpActive = false;
        }
        if (url.indexOf('/demo') >= 0) {
          this.demoActive = true;
          this.homeActive = this.editorActive = this.helpActive = false;
        }
        if (url.indexOf('/help') >= 0) {
          this.helpActive = true;
          this.homeActive = this.demoActive = this.editorActive = false;
        }
      }
    });
  }

}
