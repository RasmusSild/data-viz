import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-centrality-table',
  templateUrl: './centrality-table.component.html',
  styleUrls: ['./centrality-table.component.css']
})
export class CentralityTableComponent implements OnInit {

  @Input() data;
  @Input() open;
  @Output() close: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  openChange(value: boolean) {
    if (value === false) {
      this.close.emit();
    }
  }

}
