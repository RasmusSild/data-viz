import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as d3Select from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Time from 'd3-time-format';
import * as d3DSV from 'd3';

@Component({
  selector: 'app-line-chart',
  template: `<svg id='chart' [attr.height.px]="options.height" [attr.width.px]="options.width"></svg>
    <div id='tt' class="tooltipchart"></div>`
})
export class LineChartComponent implements OnInit, OnChanges {

  @Input() options: any;
  private formattedData = [];
  private columns: any;
  private margin = {top: 20, right: 20, bottom: 80, left: 50};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;

  constructor() {
  }

  ngOnInit() {
    this.drawChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    // $('#tt').empty();
    // $('#chart').empty();
    this.drawChart();
  }

  drawChart() {
    this.width = this.options.width - this.margin.left - this.margin.right ;
    this.height = this.options.height - this.margin.top - this.margin.bottom;
    this.parseData();
    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawLine();
  }

  parseData() {
    const a = d3DSV.tsvParse(this.options.data);
    this.columns = a.columns;
    delete a.columns;
    const parseTime = d3Time.timeParse('%e-%b-%y');
    this.formattedData = [];
    a.forEach((d) => {
      this.formattedData.push({
        'x': parseTime(d[this.columns[0]]),
        'y': parseFloat(d[this.columns[1]]),
        'tooltip': d[this.columns[1]]
      });
    });
  }

  initSvg() {
    this.svg = d3Select.select('svg')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  initAxis() {
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(this.formattedData, (d) => d.x ));
    this.y.domain(d3Array.extent(this.formattedData, (d) => d.y ));
  }

  drawAxis() {

    const xAxis = d3Axis.axisBottom(this.x);
    const yAxis = d3Axis.axisLeft(this.y);

    this.svg.append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '-.65em')
      .attr('transform', 'rotate(270)' );

    this.svg.append('g')
      .call(yAxis);
  }

  drawLine() {
    this.line = d3Shape.line()
      .x( (d: any) => this.x(d.x) )
      .y( (d: any) => this.y(d.y) );

    this.svg.append('path')
      .datum(this.formattedData)
      .attr('class', 'line')
      .attr('d', this.line)
      .style('fill', 'none')
      .style('stroke', 'pink')
      .style('stroke-width', 'none');

    this.svg.append('g')
      .selectAll('circle')
      .data(this.formattedData)
      .enter()
      .append('circle')
      .attr('r', 2)
      .attr('cx', (d: any) => this.x(d.x))
      .attr('cy', (d: any) =>  this.y(d.y))
      .attr('fill', 'black')
      .attr('stroke', 'black');
      /*.on('mouseover', function(d) {
        $( '.tooltipchart' ).animate({
          opacity: 0.9,
        }, 200, function() {
        });
        d3Select.select('#tt').html(d.tooltip + '<br>' + d.y)
          .style('left', (d3Select.event.pageX - 20) + 'px')
          .style('top', (d3Select.event.pageY - 170) + 'px');
      })
      .on('mouseout', function() {
        $( '.tooltipchart' ).animate({
          opacity: 0,
        }, 500, function() {
        });
      });*/
  }

}
