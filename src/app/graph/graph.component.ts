import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import * as d3 from 'd3';
import * as jsnx from 'jsnetworkx';
declare var require: any;
var centrality = require('ngraph.centrality');
var ngraph = require('ngraph.graph');
// import * as centrality from 'ngraph.centrality';
// import * as ngr from 'ngraph.graph';
import { Mode } from '../global';

@Component({
  selector: 'app-graph',
  template: `<svg id='graph' height='600' width='960'></svg>`,
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, OnChanges {

  @Input() options: any;
  @Output() tableData = new EventEmitter();
  private simulation: any;
  private svg: any;
  private nodes: any;
  private edges: any;
  private graph: any;
  private ngraph: any;
  private nodesSvg;
  private edgesSvg;
  private eigenvector;
  private betweenness;
  private degree;
  private closeness;
  private clustering;
  private colorScale;
  private sizeScale;

  constructor() {}

  ngOnInit() {
    this.formatData();
    this.createGraph();
    this.drawGraph();
  }

  ngOnChanges(changes: SimpleChanges) {
    // this.svg.selectAll('*').remove();
    // this.drawGraph();
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
    const edgelist = d3.csvParse(this.options.data);
    const nodeHash = {};
    const nodes = [];
    const edges = [];

    edgelist.forEach((edge) => {
      if (!nodeHash[edge.source]) {
        nodeHash[edge.source] = {id: edge.source, label: edge.source};
        nodes.push(nodeHash[edge.source]);
      }
      if (!nodeHash[edge.target]) {
        nodeHash[edge.target] = {id: edge.target, label: edge.target};
        nodes.push(nodeHash[edge.target]);
      }

      edges.push({
        id: nodeHash[edge.source].id + '-' + nodeHash[edge.target].id,
        source: nodeHash[edge.source],
        target: nodeHash[edge.target],
        weight: edge.weight
      });
    });

    this.nodes = nodes;
    this.edges = edges;
  }

  formatTSV() {

  }

  formatJSON() {

  }

  changeVizMode(mode: Mode) {
    const evExtent = d3.extent(d3.values(this.eigenvector._stringValues));
    const bwExtent = d3.extent(d3.values(this.betweenness._stringValues));
    const cnExtent = d3.extent(d3.values(this.closeness));
    const dgExtent = d3.extent(d3.values(this.degree));
    // const clExtent = d3.extent(d3.values(this.clustering._stringValues));

    if (mode === Mode.Eigenvector) {
      // this.sizeScale.domain(clExtent);
      this.colorScale.domain([d3.min(evExtent), d3.mean(evExtent), d3.max(evExtent)]);
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.eigenvector._stringValues[d.id]))
        .attr('r', 7);
        // .attr('r', (d) => this.sizeScale(this.clustering._stringValues[d.id]));
      this.tableData.emit(this.eigenvector._stringValues);
    } else if (mode === Mode.Betweenness) {
      this.colorScale.domain([d3.min(bwExtent), d3.mean(bwExtent), d3.max(bwExtent)]);
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.betweenness._stringValues[d.id]))
        .attr('r', 7);
      this.tableData.emit(this.betweenness._stringValues);
    } else if (mode === Mode.Closeness) {
      this.colorScale.domain([d3.min(cnExtent), d3.mean(cnExtent), d3.max(cnExtent)]);
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.closeness[d.id]))
        .attr('r', 7);
      this.tableData.emit(this.closeness);
    }
    else if (mode === Mode.Degree) {
      this.colorScale.domain([d3.min(dgExtent), d3.mean(dgExtent), d3.max(dgExtent)]);
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.degree[d.id]))
        .attr('r', 7);
      this.tableData.emit(this.degree);
    }
  }

  createGraph() {
    const graph = new jsnx.Graph();
    const ng = ngraph();
    const nodeMap = this.nodes.map((d) => d.id);
    const edgeMap = this.edges.map((d) => [d.source.id, d.target.id]);

    for (let node in nodeMap) {
      if (nodeMap.hasOwnProperty(node)) {
        ng.addNode(node);
      }
    }

    for (let i = 0; i < edgeMap.length; i++) {
        ng.addLink(edgeMap[i][0], edgeMap[i][1]);
    }

    graph.addNodesFrom(nodeMap);
    graph.addEdgesFrom(edgeMap);

    this.graph = graph;

    this.degree = centrality.degree(ng);
    this.closeness = centrality.closeness(ng);
    // this.betweenness = centrality.betweenness(ng);
    this.betweenness = jsnx.betweennessCentrality(this.graph);
    this.eigenvector = jsnx.eigenvectorCentrality(this.graph);

    this.clustering = jsnx.clustering(this.graph);
    this.tableData.emit(this.eigenvector._stringValues);
  }

  drawGraph() {
    const evExtent = d3.extent(d3.values(this.eigenvector._stringValues));
    // const bwExtent = d3.extent(d3.values(this.betweenness._stringValues));
    // const clExtent = d3.extent(d3.values(this.clustering._stringValues));

    this.colorScale = d3.scaleLinear()
      .domain([0, 0.5, 1])
      .range(['blue', 'green', 'red']);
    this.sizeScale = d3.scaleLinear().domain([0, 1]).range([8, 20]);
    // this.sizeScale.domain(clExtent);
    this.colorScale.domain([d3.min(evExtent), d3.mean(evExtent), d3.max(evExtent)]);

    this.svg = d3.select('svg');

    const width = +this.svg.attr('width'),
    height = +this.svg.attr('height');

    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d) => d['source']))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    if (this.graph) {

      this.edgesSvg = this.svg.append('g')
        .selectAll('line')
        .data(this.edges)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-width', (d) => Math.sqrt(d['weight']))
        .attr('class', 'edge');

      this.nodesSvg = this.svg.append('g')
        .attr('class', 'node')
        .selectAll('circle')
        .data(this.nodes)
        .enter().append('circle')
        .attr('fill', (d) => this.colorScale(this.eigenvector._stringValues[d.id]))
        // .attr('r', (d) => this.sizeScale(this.clustering._stringValues[d.id]))
        .attr('r', 7)
        .call(d3.drag()
          .on('start', this.dragStarted.bind(this))
          .on('drag', this.dragged.bind(this))
          .on('end', this.dragEnded.bind(this)));

      this.nodesSvg.append('title')
        .text((d) => d['id']);

      this.simulation
        .nodes(this.nodes)
        .on('tick', this.ticked.bind(this));

      this.simulation.force('link')
        .links(this.edges);

    }
  }

  ticked() {
    this.edgesSvg
      .attr('x1', (d) => d['source'].x)
      .attr('y1', (d) => d['source'].y)
      .attr('x2', (d) => d['target'].x)
      .attr('y2', (d) => d['target'].y);

    this.nodesSvg
      .attr('transform', (d) => 'translate(' + d['x'] + ',' + d['y'] + ')');
  }

  dragStarted(d: any) {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(d: any) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragEnded(d: any) {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  }

}
