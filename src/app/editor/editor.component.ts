import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  data: any;
  dataType: any;
  dataValue;
  heightValue;
  widthValue;
  error;
  options;

  constructor() { }

  ngOnInit() {
  }

  saveData() {
    this.error = null;
    if (!this.dataValue) {this.error = 'Missing or faulty data!'; return; }
    if (!this.heightValue || !this.widthValue) {this.error = 'Wrong dimensions!'; return; }

    this.options = {
      data: this.dataValue,
      dataType: 'tsv',
      height: this.heightValue,
      width: this.widthValue
    };

  }

}
