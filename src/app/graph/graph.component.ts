import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-graph',
  template: `<svg id='graph' height="600" width="960"></svg>`,
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, OnChanges {

  @Input() options: any;
  private simulation: any;
  private width: number;
  private height: number;
  private svg: any;

  constructor() {}

  ngOnInit() {
    this.drawGraph();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.svg.selectAll('*').remove();
    this.drawGraph();
  }

  formatData() {
    switch (this.options.dataType) {
      case('csv'):
        this.formatCSV();
        break;
      case('tsv'):
        this.formatTSV();
        break;
      case('json'):
        this.formatJSON();
    }
  }

  formatCSV() {

  }

  formatTSV() {

  }

  formatJSON() {

  }

  drawGraph() {
    this.svg = d3.select('svg');

    const width = +this.svg.attr('width'),
    height = +this.svg.attr('height');

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d) => d['id']))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    d3.json('../../assets/miserables.json', (error, graph) => {

      console.log(graph);

      if (error) {
        throw error;
      }

      const link = this.svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(graph.links)
        .enter().append('line')
        .attr('stroke-width', (d) => Math.sqrt(d['value']));

      const node = this.svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(graph.nodes)
        .enter().append('circle')
        .attr('r', 5)
        .attr('fill', (d) => color(d['group']))
        .call(d3.drag()
          .on('start', this.dragStarted.bind(this))
          .on('drag', this.dragged.bind(this))
          .on('end', this.dragEnded.bind(this)));

      node.append('title')
        .text((d) => d['id']);

      this.simulation
        .nodes(graph.nodes)
        .on('tick', ticked);

      this.simulation.force('link')
        .links(graph.links);

      function ticked() {
        link
          .attr('x1', (d) => d['source'].x)
          .attr('y1', (d) => d['source'].y)
          .attr('x2', (d) => d['target'].x)
          .attr('y2', (d) => d['target'].y);

        node
          .attr('cx', (d) => d['x'])
          .attr('cy', (d) => d['y']);
      }
    });
  }

  dragStarted(d) {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragEnded(d) {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  }

}
