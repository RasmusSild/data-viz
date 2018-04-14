import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Mode } from '../global';
import { GraphComponent } from '../graph/graph.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit {

  @ViewChild(GraphComponent) graph: GraphComponent;
  data: any;
  // dataType: any;
  dataValue: any;
  // heightValue = 600;
  // widthValue = 600;
  error: string;
  options: any;
  dataProvider = 'file';
  file: File;
  modes = Mode;
  mode: Mode = Mode.Eigenvector;
  tableData;
  tableDataKeys;
  fileError = false;
  fileSuccess = false;
  centralityActive = true;
  customiserActive = false;
  uploaderVisible = true;
  graphStyle;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {

  }

  changeDataProvider(value) {
    this.dataProvider = value;
  }

  receivedTableData(data) {
    this.tableData = data;
    this.tableDataKeys = Object.keys(data);
  }

  receivedStyleObject(data) {
    this.graph.applyStyleFromObject(data);
    this.graphStyle = data;
  }

  changeVizMode(mode: Mode) {
    this.mode = mode;
    this.graph.changeVizMode(mode);
  }

  fileChanged(e) {
    this.file = e.target.files[0];
  }

  uploadFile() {
    const fileReader = new FileReader();
    fileReader.onerror = (e) => {
      this.fileError = true;
      this.fileSuccess = false;
      setTimeout(() => { this.fileError = false; }, 3000);
    };
    fileReader.onload = (e) => {
      this.fileSuccess = true;
      this.fileError = false;
      this.dataValue = fileReader.result;
      setTimeout(() => { this.fileSuccess = false; }, 3000);
    };
    fileReader.readAsText(this.file);
  }

  saveData() {
    this.error = null;
    if (!this.dataValue) {this.error = 'Missing or faulty data!'; return; }
    // if (!this.heightValue || !this.widthValue) {this.error = 'Wrong dimensions!'; return; }

    this.uploaderVisible = false;
    if (this.fileSuccess === true) {this.fileSuccess = false; } // TODO wtf is going on????

    this.options = {
      data: this.dataValue,
      dataType: this.file.name.split('.').pop()
      // height: this.heightValue,
      // width: this.widthValue
    };

  }

}
