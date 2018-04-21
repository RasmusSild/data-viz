import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-customiser',
  templateUrl: './customiser.component.html',
  styleUrls: ['./customiser.component.css']
})
export class CustomiserComponent implements OnInit {

  styleObject = {
    minValueColor : '#0000ff',
    medValueColor : '#00ff00',
    maxValueColor : '#ff0000',
    edgeColor : '#999999',
    arrowColor : '#999999',
    nodeSize : 7
  };

  @Input() inputStyleObj: any;
  @Input() graphOptions: any;
  @Output() sendStyleObject = new EventEmitter();

  constructor() { }

  ngOnInit() {
    if (this.inputStyleObj) {
      this.styleObject = {
        minValueColor : this.inputStyleObj.minValueColor,
        medValueColor : this.inputStyleObj.medValueColor,
        maxValueColor : this.inputStyleObj.maxValueColor,
        edgeColor : this.inputStyleObj.edgeColor,
        arrowColor : this.inputStyleObj.arrowColor,
        nodeSize : this.inputStyleObj.nodeSize
      };
    }
  }

  applyStyle(e) {
    e.preventDefault();
    if (!this.styleObject.nodeSize) {
      return;
    } else {
      this.sendStyleObject.emit(this.styleObject);
    }
  }

}
