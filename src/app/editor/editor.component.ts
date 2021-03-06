import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Mode } from '../global';
import { GraphComponent } from '../graph/graph.component';
import * as d3 from 'd3';
import { ClrWizard } from '@clr/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  @Input() demoMode = false;
  @Input() demoOptions;
  @ViewChild(GraphComponent) graph: GraphComponent;
  @ViewChild('wizard') wizard: ClrWizard;
  data: any;
  dataValue: any;
  error: string;
  options: any;
  file: File;
  modes = Mode;
  mode: Mode = Mode.Degree;
  tableData;
  dataColumns;
  fileError = false;
  graphGenerationError = false;
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
  router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  ngOnInit() {
    if (this.demoOptions) {
      this.options = this.demoOptions;
    }
  }

  reset() {
    this.fileError = this.fileSuccess = this.customiserActive = this.showArrows = false;
    this.wizardOpen = this.centralityActive = this.uploaderVisible = true;
    this.options = this.data = this.dataValue = this.error = this.tableData =
      this.dataColumns = this.graphStyle = this.rootNodeValue = this.destNodeValue = this.centralityTableData = null;
    this.wizard.reset();
  }

  receivedGraphError(dataOk) {
    this.graphGenerationError = dataOk !== true;
  }

  receivedTableData(data) {
    this.tableData = data;
  }

  receivedFullTableData(data) {
    this.centralityTableData = data;
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
    this.error = null;
    const extension = this.file.name.split('.').pop();
    const fileReader = new FileReader();
    const extensions = ['csv', 'tsv', 'json'];
    if (extensions.indexOf(extension) < 0) {
      this.error = 'File format not supported!';
      return;
    }
    fileReader.onerror = (e) => {
      this.fileError = true;
      this.fileSuccess = false;
      this.error = null;
    };
    fileReader.onload = (e) => {
      this.fileSuccess = true;
      this.fileError = false;
      this.error = null;
      this.dataValue = fileReader.result;
    };
    fileReader.readAsText(this.file);
  }

  page1Handler(buttonType) {
    if ('custom-danger' === buttonType) {
      this.router.navigate(['/']);
    }
    if ('custom-next' === buttonType) {
      if (!this.dataValue) {this.error = 'Missing or faulty data!'; return; }
      const extension = this.file.name.split('.').pop();
      if (extension === 'csv') {
        this.dataColumns = d3.csvParse(this.dataValue).columns;
      } else if (extension === 'tsv') {
        this.dataColumns = d3.tsvParse(this.dataValue).columns;
      } else if (extension === 'json') {
        this.dataValue = JSON.parse(this.dataValue);
        if (Array.isArray(this.dataValue)) {
          console.log(this.dataValue[0]);
        } else {
          const keys = Object.keys(this.dataValue);
          this.dataValue = this.dataValue[keys[0]];
        }
        this.dataColumns = Object.keys(this.dataValue[0]);
      } else {
        this.error = 'File format not supported!';
        return;
      }
      this.rootNodeValue = this.dataColumns[0];
      this.destNodeValue = this.dataColumns[1];
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

  wizardCancel() {
    this.router.navigate(['/']);
  }

}
