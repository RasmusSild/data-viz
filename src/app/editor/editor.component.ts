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
  dataValue: any;
  heightValue: 400;
  widthValue: 600;
  error: string;
  options: any;
  dataProvider = 'manual';
  file: File;

  constructor() { }

  ngOnInit() {
  }

  changeDataProvider(value) {
    this.dataProvider = value;
  }

  fileChanged(e) {
    this.file = e.target.files[0];
    console.log(this.file.name);
  }

  uploadFile() {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.dataValue = fileReader.result;
    };
    fileReader.readAsText(this.file);
  }

  saveData() {
    console.log(this.dataValue);
    this.error = null;
    if (!this.dataValue) {this.error = 'Missing or faulty data!'; return; }
    if (!this.heightValue || !this.widthValue) {this.error = 'Wrong dimensions!'; return; }

    this.options = {
      data: this.dataValue,
      dataType: this.file.name.split('.').pop(),
      height: this.heightValue,
      width: this.widthValue
    };

  }

}
