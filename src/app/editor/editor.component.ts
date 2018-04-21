import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Mode } from '../global';
import { GraphComponent } from '../graph/graph.component';
import * as d3 from 'd3';
import { ClrWizard } from '@clr/angular';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit {

  @ViewChild(GraphComponent) graph: GraphComponent;
  @ViewChild('wizard') wizard: ClrWizard;
  data: any;
  dataValue: any;
  error: string;
  options: any;
  dataProvider = 'file';
  file: File;
  modes = Mode;
  mode: Mode = Mode.Eigenvector;
  tableData;
  tableDataKeys;
  dataColumns;
  fileError = false;
  fileSuccess = false;
  centralityActive = true;
  customiserActive = false;
  uploaderVisible = true;
  graphStyle;
  wizardOpen = true;
  rootNodeValue;
  destNodeValue;
  showArrows: false;
  centralityTableData;
  showCentralityTable = false;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {

  }

  /*changeDataProvider(value) {
    this.dataProvider = value;
  }*/

  receivedTableData(data) {
    this.tableData = data;
    this.tableDataKeys = Object.keys(data);
  }

  receivedFullTableData(data) {
    this.centralityTableData = data;
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
      this.error = null;
      setTimeout(() => { this.fileError = false; }, 3000);
    };
    fileReader.onload = (e) => {
      this.fileSuccess = true;
      this.fileError = false;
      this.error = null;
      this.dataValue = fileReader.result;
      setTimeout(() => { this.fileSuccess = false; }, 3000);
    };
    fileReader.readAsText(this.file);
  }

  page1Handler(buttonType) {
    if ('custom-next' === buttonType) {
      if (!this.dataValue) {this.error = 'Missing or faulty data!'; return; }
      this.dataColumns = d3.csvParse(this.dataValue).columns;
      if (this.fileSuccess === true) {this.fileSuccess = false; }
      this.wizard.next();
    }
  }

  page2Handler(buttonType) {
    if ('custom-previous' === buttonType) {
      this.wizard.previous();
    }
    if ('custom-finish' === buttonType) {
      this.error = null;
      this.uploaderVisible = false;
      this.wizard.finish();
      this.options = {
        data: this.dataValue,
        dataType: this.file.name.split('.').pop(),
        rootNode: this.rootNodeValue,
        destNode: this.destNodeValue,
        showArrows: this.showArrows
      };
    }
  }

}
