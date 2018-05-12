import { AfterViewInit, Component, OnInit, isDevMode } from '@angular/core';
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
  devMode = isDevMode();

  constructor(private router: Router) {
  }

  ngOnInit() {
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
        if (url === '/new') {
          this.editorActive = true;
          this.homeActive = this.demoActive = this.helpActive = false;
        }
        if (url === '/demo') {
          this.demoActive = true;
          this.homeActive = this.editorActive = this.helpActive = false;
        }
        if (url === '/help') {
          this.helpActive = true;
          this.homeActive = this.demoActive = this.editorActive = false;
        }
      }
    });
  }

}
