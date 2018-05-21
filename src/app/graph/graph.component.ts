import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Mode, getViewportDimensions } from '../global';
import { Subscription } from 'rxjs/Subscription';
import { ResizeService } from '../resize.service';
import * as d3 from 'd3';
import 'd3-selection-multi';
import { legendColor } from 'd3-svg-legend';
import * as jsnx from 'jsnetworkx';
declare var require: any;
const centrality = require('ngraph.centrality');
const ngraph = require('ngraph.graph');

@Component({
  selector: 'app-graph',
  template: '<svg id=\'graph\' height=\'1020\' width=\'1280\'></svg>\n' +
  '<div class=\'tooltip\'></div>',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, OnDestroy {

  @Input() options: any;
  @Input() demoMode: boolean;
  @Output() tableData = new EventEmitter();
  @Output() sendFullTableData = new EventEmitter();
  @Output() sendError = new EventEmitter();
  private fullTableData = [];
  private simulation: any;
  private svg: any;
  private nodes: Array<any>;
  private edges: Array<any>;
  private graph: any;
  private nodesSvg;
  private edgesSvg;
  private eigenvector;
  private betweenness;
  private degree;
  private closeness;
  private colorScale;
  private sizeScale;
  private containerGroup;
  private resizeSubscription: Subscription;
  private evExtent;
  private bwExtent;
  private cnExtent;
  private dgExtent;
  private mode = Mode.Degree;
  private nodeSize = 7;
  private linksWidth = 2;
  private defs;
  private tooltipDiv;
  private tooltipDisabled = false;
  private linkedByIndex = {};
  private toggle = 0;
  private legend;
  private dataOk = false;

  constructor(private resizeService: ResizeService) {}

  ngOnInit() {

    this.resizeSubscription = this.resizeService.onResize$
      .subscribe(() => this.resizeGraph());

    this.formatData();
    this.createGraph();
    this.drawGraph();
  }

  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  formatData() {
    let edgelist;
    const nodeHash = {};
    const nodes = [];
    const edges = [];
    const root = this.options.rootNode;
    const dest = this.options.destNode;

    if (this.demoMode && this.demoMode === true) {
      edgelist = this.options.data;
    } else {
      if (this.options.dataType === 'csv') {
        edgelist = d3.csvParse(this.options.data);
      } else if (this.options.dataType === 'tsv') {
        edgelist = d3.csvParse(this.options.data);
      } else {
        edgelist = this.options.data;
      }
    }

    try {
      edgelist.forEach((edge) => {
        if (!nodeHash[edge[root]]) {
          nodeHash[edge[root]] = {id: edge[root], label: edge[dest]};
          nodes.push(nodeHash[edge[root]]);
        }
        if (!nodeHash[edge[dest]]) {
          nodeHash[edge[dest]] = {id: edge[dest], label: edge[dest]};
          nodes.push(nodeHash[edge[dest]]);
        }

        edges.push({
          id: nodeHash[edge[root]].id + '-' + nodeHash[edge[dest]].id,
          source: nodeHash[edge[root]],
          target: nodeHash[edge[dest]],
          weight: edge.weight
        });
      });
    } catch (e) {
      console.log(e);
      this.dataOk = false;
      this.sendError.emit(this.dataOk);
      return;
    }

    this.nodes = nodes;
    this.edges = edges;

  }

  createGraph() {
    const graph = new jsnx.Graph();
    const ng = ngraph();
    const nodeMap = this.nodes.map((d) => d.id);
    const edgeMap = this.edges.map((d) => [d.source.id, d.target.id]);

    for (let i = 0; i < nodeMap.length; i++) {
      try {
        ng.addNode(nodeMap[i]);
      } catch (e) {
        console.log(e);
        this.dataOk = false;
        this.sendError.emit(this.dataOk);
        return;
      }
    }

    for (let i = 0; i < edgeMap.length; i++) {
        ng.addLink(edgeMap[i][0], edgeMap[i][1]);
    }

    graph.addNodesFrom(nodeMap);
    graph.addEdgesFrom(edgeMap);

    this.graph = graph;

    this.degree = centrality.degree(ng);
    this.closeness = this.roundCentralityData(centrality.closeness(ng), 5);
    this.betweenness = this.roundCentralityData(jsnx.betweennessCentrality(this.graph)._stringValues, 5);
    this.eigenvector = this.roundCentralityData(jsnx.eigenvectorCentrality(this.graph)._stringValues, 5);
    this.dataOk = true;
    this.sendError.emit(this.dataOk);

    for (const key in this.eigenvector) {
        this.fullTableData.push({
          id: key,
          Eigenvector: this.eigenvector[key],
          Betweenness: this.betweenness[key],
          Closeness: this.closeness[key],
          Degree: this.degree[key]
        });
    }

    this.tableData.emit(this.sortCentralityData(this.degree, 'desc'));
    this.sendFullTableData.emit(this.fullTableData);
  }

  drawGraph() {

    if (this.dataOk === false) {
      return;
    }

    const dgExtent = d3.extent(d3.values(this.degree));

    this.colorScale = d3.scaleLinear()
      .domain([0, 0.5, 1])
      .range([<any>'#0000ff', '#00ff00', '#ff0000']);
    this.sizeScale = d3.scaleLinear().domain([0, 1]).range([8, 50]);
    this.sizeScale.domain(dgExtent);
    this.colorScale.domain([d3.min(dgExtent), d3.mean(<any>dgExtent), d3.max(dgExtent)]);

    this.svg = d3.select('svg');
    const viewport = getViewportDimensions();
    this.svg.attr('width', (viewport.width / 3) * 2);
    this.svg.attr('height', viewport.height  - 60);

    const width = +this.svg.attr('width'),
    height = +this.svg.attr('height');

    this.tooltipDiv = d3.select('.tooltip');

    if (this.options.showArrows && this.options.showArrows === true) {
      this.defs = this.svg.append('defs').append('marker')
        .attrs({
          'id': 'arrowhead',
          'viewBox': '-0 -5 10 10',
          'refX': 17,
          'refY': 0,
          'orient': 'auto',
          'markerWidth' : 5,
          'markerHeight': 5,
          'xoverflow': 'visible'})
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#999')
        .style('stroke', 'none');
    }

    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d) => d['source']))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    if (this.graph) {

      this.containerGroup = this.svg.append('g');

      this.edgesSvg = this.containerGroup.append('g')
        .selectAll('line')
        .data(this.edges)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-width', this.linksWidth)
        .attr('class', 'edge');

      if (this.options.showArrows && this.options.showArrows === true) {
        this.edgesSvg.attr('marker-end', 'url(#arrowhead)');
      }

      this.nodesSvg = this.containerGroup.append('g')
        .attr('class', 'node')
        .selectAll('circle')
        .data(this.nodes)
        .enter().append('circle')
        .attr('id', (d) => d.id)
        .attr('fill', (d) => this.colorScale(this.degree[d.id]))
        .attr('r', this.nodeSize)
        .on('mouseover', this.tooltipMouseOver.bind(this))
        .on('mouseout', this.tooltipMouseOut.bind(this))
        .on('click', this.showConnectedNodes.bind(this))
        .call(d3.drag()
          .on('start', this.dragStarted.bind(this))
          .on('drag', this.dragged.bind(this))
          .on('end', this.dragEnded.bind(this)));

      const zoom = d3.zoom().on('zoom', this.onZoom.bind(this));
      zoom(this.svg);

      this.simulation
        .nodes(this.nodes)
        .on('tick', this.ticked.bind(this));

      this.simulation.force('link')
        .links(this.edges);

      for (let i = 0; i < this.nodes.length; i++) {
        this.linkedByIndex[i + ',' + i] = 1;
      }

      this.edges.forEach((d) => {
        this.linkedByIndex[d.source.index + ',' + d.target.index] = 1;
      });

      this.drawLegend();

    }
  }

  drawLegend() {
    this.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(20,20)');

    this.legend = legendColor()
      .shapeWidth(40)
      .orient('horizontal')
      .scale(this.colorScale);

    if (this.mode === Mode.Degree) {
      this.legend.labelFormat(d3.format('.0f'));
    } else {
      this.legend.labelFormat(d3.format('.2f'));
    }

    this.svg.select('.legend')
      .call(this.legend);
  }

  redrawLegend() {
    this.svg.select('.legendLinear').remove();
    this.drawLegend();
  }

  changeVizMode(mode: Mode) {
    this.evExtent = d3.extent(d3.values(this.eigenvector));
    this.bwExtent = d3.extent(d3.values(this.betweenness));
    this.cnExtent = d3.extent(d3.values(this.closeness));
    this.dgExtent = d3.extent(d3.values(this.degree));

    if (mode === Mode.Eigenvector) {
      this.mode = Mode.Eigenvector;
      this.colorScale.domain([d3.min(this.evExtent), d3.mean(<any>this.evExtent), d3.max(this.evExtent)]);
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.eigenvector[d.id]))
        .attr('r', this.nodeSize);
      this.tableData.emit(this.sortCentralityData(this.eigenvector, 'desc'));
    } else if (mode === Mode.Betweenness) {
      this.mode = Mode.Betweenness;
      this.colorScale.domain([d3.min(this.bwExtent), d3.mean(<any>this.bwExtent), d3.max(this.bwExtent)]);
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.betweenness[d.id]))
        .attr('r', this.nodeSize);
      this.tableData.emit(this.sortCentralityData(this.betweenness, 'desc'));
    } else if (mode === Mode.Closeness) {
      this.mode = Mode.Closeness;
      this.colorScale.domain([d3.min(this.cnExtent), d3.mean(<any>this.cnExtent), d3.max(this.cnExtent)]);
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.closeness[d.id]))
        .attr('r', this.nodeSize);
      this.tableData.emit(this.sortCentralityData(this.closeness, 'desc'));
    } else if (mode === Mode.Degree) {
      this.mode = Mode.Degree;
      this.colorScale.domain([d3.min(this.dgExtent), d3.mean(<any>this.dgExtent), d3.max(this.dgExtent)]);
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.degree[d.id]))
        .attr('r', this.nodeSize);
      this.tableData.emit(this.sortCentralityData(this.degree, 'desc'));
    }

    this.redrawLegend();
  }

  applyStyleFromObject(styleObject) {
    this.colorScale
      .range([<any>styleObject.minValueColor, styleObject.medValueColor, styleObject.maxValueColor]);

    if (this.mode === Mode.Eigenvector) {
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.eigenvector[d.id]));
    } else if (this.mode === Mode.Betweenness) {
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.betweenness[d.id]));
    } else if (this.mode === Mode.Closeness) {
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.closeness[d.id]));
    } else if (this.mode === Mode.Degree) {
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.degree[d.id]));
    }

    this.nodeSize = styleObject.nodeSize;
    this.linksWidth = styleObject.linksWidth;

    this.nodesSvg
      .attr('r', this.nodeSize);

    this.edgesSvg
      .attr('stroke', styleObject.edgeColor)
      .attr('stroke-width', this.linksWidth);

    if (this.options.showArrows && this.options.showArrows === true) {
      d3.select('marker').attr('refX', this.nodeSize + 10);
      this.defs
        .attr('fill', styleObject.arrowColor);
    }

    this.redrawLegend();
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
    this.tooltipDisabled = true;
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
    this.tooltipDisabled = false;
    if (!d3.event.active) {
      this.simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  }

  tooltipMouseOver(d: any) {
    if (this.tooltipDisabled === false) {
      this.tooltipDiv.transition()
        .duration(200)
        .style('opacity', .9);
      this.tooltipDiv.html(d['id'])
        .style('left', (d3.event.pageX) + 'px')
        .style('top', (d3.event.pageY - 40) + 'px');
    }
  }

  tooltipMouseOut() {
    this.tooltipDiv.transition()
      .duration(500)
      .style('opacity', 0);
  }

  onZoom() {
    this.containerGroup.attr('transform', d3.event.transform);
  }

  resizeGraph() {
    const viewport = getViewportDimensions();
    this.svg.attr('width', (viewport.width / 3) * 2);
    this.svg.attr('height', viewport.height  - 60);

    const width = +this.svg.attr('width'),
      height = +this.svg.attr('height');

    this.simulation.force('center', d3.forceCenter(width / 2, height / 2));
  }

  isNeighboringNode(a, b) {
    return this.linkedByIndex[a.index + ',' + b.index];
  }

  showConnectedNodes(d: any) {
    if (this.toggle === 0) {
      this.nodesSvg.style('opacity', (o) => {
        return this.isNeighboringNode(d, o) || this.isNeighboringNode(o, d) ? 1 : 0.1;
      });
      this.edgesSvg.style('opacity', (o) => {
        return d.index === o.source.index || d.index === o.target.index ? 1 : 0.1;
      });
      this.toggle = 1;
    } else {
      this.nodesSvg.style('opacity', 1);
      this.edgesSvg.style('opacity', 1);
      this.toggle = 0;
    }
  }

  roundCentralityData(data, decimal) {
    for (const key in data) {
      data[key] = +(data[key].toFixed(decimal));
    }

    return data;
  }

  sortCentralityData(data, order) {
    const keys = Object.keys(data);
    const newArr = [];
    if (order === 'desc') {
      keys.sort((a, b) => data[b] - data[a]);
    } else {
      keys.sort((a, b) => data[a] - data[b]);
    }
    let i = 0;
    while (i < keys.length) {
      newArr.push({
        id: keys[i],
        value: data[keys[i]]
      });
      i++;
    }
    return newArr;
  }

}
