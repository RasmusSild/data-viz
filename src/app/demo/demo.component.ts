import { Component } from '@angular/core';
import * as demo_data from './demo_graphdata.json';

@Component({
  selector: 'app-demo',
  template: '<app-editor [demoMode]="true" [demoOptions]="demo_options"></app-editor>'
})
export class DemoComponent {

  demo_data = demo_data;
  demo_options = {
    data: this.demo_data,
    dataType: 'json',
    rootNode: 'Source',
    destNode: 'Target',
    showArrows: false
  };

  constructor() {}

}
