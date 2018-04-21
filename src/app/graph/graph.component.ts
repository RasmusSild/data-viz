import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Mode, getViewportDimensions } from '../global';
import { Subscription } from 'rxjs/Subscription';
import { ResizeService } from '../resize.service';
import * as d3 from 'd3';
import 'd3-selection-multi';
import * as jsnx from 'jsnetworkx';
declare var require: any;
const centrality = require('ngraph.centrality');
const ngraph = require('ngraph.graph');

@Component({
  selector: 'app-graph',
  template: `<svg id='graph' height="1020" width="1280"></svg>
            <div class='tooltip'></div>`,
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, OnChanges, OnDestroy {

  @Input() options: any;
  @Output() tableData = new EventEmitter();
  @Output() sendFullTableData = new EventEmitter();
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
  private clustering;
  private colorScale;
  private sizeScale;
  private containerGroup;
  private resizeSubscription: Subscription;
  private evExtent;
  private bwExtent;
  private cnExtent;
  private dgExtent;
  private mode = Mode.Eigenvector;
  private nodeSize = 7;
  private defs;
  private tooltipDiv;
  private tooltipDisabled = false;

  constructor(private resizeService: ResizeService) {}

  ngOnInit() {

    this.resizeSubscription = this.resizeService.onResize$
      .subscribe(() => this.resizeGraph());

    this.formatData();
    this.createGraph();
    this.drawGraph();
  }

  ngOnChanges(changes: SimpleChanges) {
    // this.svg.selectAll('*').remove();
    // this.drawGraph();
  }

  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  formatData() {
    if (this.options.dataType === 'csv' || this.options.dataType === 'tsv') {
      this.formatDSV(this.options.dataType);
    } else {
      this.formatJSON();
    }
  }

  formatDSV(dataType) {
    const edgelist = dataType === 'csv' ? d3.csvParse(this.options.data) : d3.tsvParse(this.options.data);
    const nodeHash = {};
    const nodes = [];
    const edges = [];
    const root = this.options.rootNode;
    const dest = this.options.destNode;

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

    this.nodes = nodes;
    this.edges = edges;
  }

  formatJSON() {
    console.log(JSON.parse(this.options.data));
  }

  changeVizMode(mode: Mode) {
    this.evExtent = d3.extent(d3.values(this.eigenvector._stringValues));
    this.bwExtent = d3.extent(d3.values(this.betweenness._stringValues));
    this.cnExtent = d3.extent(d3.values(this.closeness));
    this.dgExtent = d3.extent(d3.values(this.degree));
    // const clExtent = d3.extent(d3.values(this.clustering._stringValues));

    if (mode === Mode.Eigenvector) {
      this.mode = Mode.Eigenvector;
      // this.sizeScale.domain(clExtent);
      this.colorScale.domain([d3.min(this.evExtent), d3.mean(<any>this.evExtent), d3.max(this.evExtent)]);
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.eigenvector._stringValues[d.id]))
        .attr('r', this.nodeSize);
        // .attr('r', (d) => this.sizeScale(this.clustering._stringValues[d.id]));
      this.tableData.emit(this.eigenvector._stringValues);
    } else if (mode === Mode.Betweenness) {
      this.mode = Mode.Betweenness;
      this.colorScale.domain([d3.min(this.bwExtent), d3.mean(<any>this.bwExtent), d3.max(this.bwExtent)]);
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.betweenness._stringValues[d.id]))
        .attr('r', this.nodeSize);
      this.tableData.emit(this.betweenness._stringValues);
    } else if (mode === Mode.Closeness) {
      this.mode = Mode.Closeness;
      this.colorScale.domain([d3.min(this.cnExtent), d3.mean(<any>this.cnExtent), d3.max(this.cnExtent)]);
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.closeness[d.id]))
        .attr('r', this.nodeSize);
      this.tableData.emit(this.closeness);
    } else if (mode === Mode.Degree) {
      this.mode = Mode.Degree;
      this.colorScale.domain([d3.min(this.dgExtent), d3.mean(<any>this.dgExtent), d3.max(this.dgExtent)]);
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.degree[d.id]))
        .attr('r', this.nodeSize);
      this.tableData.emit(this.degree);
    }
  }

  createGraph() {
    const graph = new jsnx.Graph();
    const ng = ngraph();
    const nodeMap = this.nodes.map((d) => d.id);
    const edgeMap = this.edges.map((d) => [d.source.id, d.target.id]);

    for (const node in nodeMap) {
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
    this.betweenness = jsnx.betweennessCentrality(this.graph);
    this.eigenvector = jsnx.eigenvectorCentrality(this.graph);

    for (const key in this.eigenvector._stringValues) {
        this.fullTableData.push({
          id: key,
          Eigenvector: this.eigenvector._stringValues[key],
          Betweenness: this.betweenness._stringValues[key],
          Closeness: this.closeness[key],
          Degree: this.degree[key]
        });
    }

    this.clustering = jsnx.clustering(this.graph);
    this.tableData.emit(this.eigenvector._stringValues);
    this.sendFullTableData.emit(this.fullTableData);
  }

  drawGraph() {
    const evExtent = d3.extent(d3.values(this.eigenvector._stringValues));

    this.colorScale = d3.scaleLinear()
      .domain([0, 0.5, 1])
      .range([<any>'#0000ff', '#00ff00', '#ff0000']);
    this.sizeScale = d3.scaleLinear().domain([0, 1]).range([8, 20]);
    // this.sizeScale.domain(clExtent);
    this.colorScale.domain([d3.min(evExtent), d3.mean(<any>evExtent), d3.max(evExtent)]);

    this.svg = d3.select('svg');
    const viewport = getViewportDimensions();
    this.svg.attr('width', (viewport.width / 3) * 2);
    this.svg.attr('height', viewport.height  - 60);

    const width = +this.svg.attr('width'),
    height = +this.svg.attr('height');

    this.tooltipDiv = d3.select('.tooltip');

    if (this.options.showArrows === true) {
      this.defs = this.svg.append('defs').append('marker')
        .attrs({
          'id': 'arrowhead',
          'viewBox': '-0 -5 10 10',
          'refX': 13,
          'refY': 0,
          'orient': 'auto',
          'markerWidth' : 5,
          'markerHeight': 5,
          'xoverflow': 'visible'})
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
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
        .attr('stroke-width', (d) => Math.sqrt(d['weight']))
        .attr('class', 'edge');

      if (this.options.showArrows === true) {
        this.edgesSvg.attr('marker-end', 'url(#arrowhead)');
      }

      this.nodesSvg = this.containerGroup.append('g')
        .attr('class', 'node')
        .selectAll('circle')
        .data(this.nodes)
        .enter().append('circle')
        .attr('fill', (d) => this.colorScale(this.eigenvector._stringValues[d.id]))
        // .attr('r', (d) => this.sizeScale(this.clustering._stringValues[d.id]))
        .attr('r', this.nodeSize)
        .on('mouseover', this.tooltipMouseOver.bind(this))
        .on('mouseout', this.tooltipMouseOut.bind(this))
        .call(d3.drag()
          .on('start', this.dragStarted.bind(this))
          .on('drag', this.dragged.bind(this))
          .on('end', this.dragEnded.bind(this)));

      const zoom = d3.zoom().on('zoom', this.onZoom.bind(this));
      zoom(this.svg);

      /*this.nodesSvg.append('title')
        .text((d) => d['id']);
        */

      this.simulation
        .nodes(this.nodes)
        .on('tick', this.ticked.bind(this));

      this.simulation.force('link')
        .links(this.edges);

    }
  }

  applyStyleFromObject(styleObject) {
    this.colorScale
      .range([<any>styleObject.minValueColor, styleObject.medValueColor, styleObject.maxValueColor]);

    if (this.mode === Mode.Eigenvector) {
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.eigenvector._stringValues[d.id]));
    } else if (this.mode === Mode.Betweenness) {
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.betweenness._stringValues[d.id]));
    } else if (this.mode === Mode.Closeness) {
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.closeness[d.id]));
    } else if (this.mode === Mode.Degree) {
      this.nodesSvg
        .attr('fill', (d) => this.colorScale(this.degree[d.id]));
    }

    this.nodeSize = styleObject.nodeSize;

    this.nodesSvg
      .attr('r', this.nodeSize);

    this.edgesSvg
      .attr('stroke', styleObject.edgeColor);

    if (this.options.showArrows === true) {
      this.defs
        .attr('fill', styleObject.arrowColor);
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

  tooltipMouseOut(d: any) {
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

}
