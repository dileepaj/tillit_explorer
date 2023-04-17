import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PocDataService } from '../../../services/poc-data.service';
import * as d3 from 'd3';
import { ErrorMessage } from '../../../shared/models/error-message.model';
import * as dracula from 'graphdracula';
import { NullAstVisitor } from '@angular/compiler';
import * as dagreD3 from 'dagre-d3';
import {Location} from '@angular/common';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-poc',
  templateUrl: './proof-poc.component.html',
  styleUrls: ['./proof-poc.component.css']
})
export class ProofPocComponent implements OnInit {

  private txnId: string;
  loadingComplete: boolean = false;
  error: ErrorMessage;
  errorOccurred: boolean = false;
  pocTreeWidth: Number = 0;
  pocTreeHeight: Number = 0;
  marginx=50;
  marginy=50
  pocTransactions = [];
  selectedItem;
  color = "primary";
  mode = "indeterminate";
  value = 10;

  constructor(private route: ActivatedRoute, private pocDataService: PocDataService,  private _location: Location) { }

  ngOnInit() {
    this.txnId = this.route.snapshot.paramMap.get('txnhash');
    // this.getProofData(this.txnId);
    this.getProofTree(this.txnId);
    // this.renderGraph(this.getData().Nodes);
  }

  goBack():void{
    this._location.back();
    }

  getProofData(id: string) {
    this.pocDataService.getPocProofData(id).subscribe((data) => {

      this.loadingComplete = true;
      this.pocTransactions = data;
      this.selectedItem = this.pocTransactions[this.pocTransactions.length - 1];

      let results = this.createChild(data);
      // this.graph(results);

    }, (err) => {
      this.loadingComplete = true;
      this.errorOccurred = true;

      if (err.status === 400) {
        this.error = {
          errorTitle: "No matching results found",
          errorMessage: "There is no data associated with the given ID. Check if the entered ID is correct and try again.",
          errorMessageSecondary: "If you still don't see the results you were expecting, please let us know.",
          errorType: "empty"
        }
      } else {
        this.error = {
          errorTitle: "Something went wrong",
          errorMessage: "An error occurred while retrieving data. Check if the entered ID is correct and try again in a while.",
          errorMessageSecondary: "If you still don't see the results you were expecting, please let us know.",
          errorType: "empty"
        }
      }
    }), (err) => {
      //console.log("Error: ", err);
    };
  }

  getProofTree(id: string) {
    this.pocDataService.getPocTreeData(id).subscribe((data) => {
      this.loadingComplete = true;
      this.renderGraph(data.Nodes);
     }, (err)=> {
    })
  }

  renderGraph(Nodes: Object) {
    // Create a new directed graph
    var g: any = new dagreD3.graphlib.Graph({ directed: true });

    // Set an object for the graph label
    g.setGraph({ marginx: this.marginx,marginy: this.marginy});
    g.graph().rankdir = 'LR';
    g.graph().ranksep = 80;
    g.graph().nodesep = 8;

    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(function() {
        return {};
    });

    var genesisNodes = Object.entries(Nodes).map(data=>{
        if (!data[1].Parents) return data[1];
    })

    genesisNodes = genesisNodes.filter(n=>n);


    var doneNodes = [];
    var edgeValues :number[] = [0];

    // set nodes and edges
    for (var key in genesisNodes) {
      var max = edgeValues.reduce(function(a, b) {
        return Math.max(a, b);
      }, 98);
      this.addNodesAndEdges(g, Nodes, doneNodes, edgeValues, genesisNodes[key], max + 1, 0);
    }

    // var svg = d3.select('svg');
    var inner:any = d3.select('#pocTree'),svgGroup = inner.append("g");
    var render = new dagreD3.render();
    render(inner, g);

    let box = document.querySelector('#pocTree');
    let width = box.getBoundingClientRect().width;
    let height = box.getBoundingClientRect().height;
    this.pocTreeWidth = width + (2 * this.marginx);
    this.pocTreeHeight = height + (2 * this.marginy);
    // Center the graph
    var xCenterOffset = (inner.attr("width") - g.graph().width) / 2;
    svgGroup.attr("transform", "translate(" + xCenterOffset + ", 30)");
    inner.attr("height", g.graph().height + 50);
    //listeners
    d3.selectAll("g.edgePath").on('click', function (d: any) {
        const from = Nodes[d.v].TrustLinks[0];
        const to = Nodes[d.w].TrustLinks[0];
    });
    d3.selectAll("g.edgeLabel").on('click', function (d: any) {
        const from = Nodes[d.v].TrustLinks[0];
        const to = Nodes[d.w].TrustLinks[0];
        window.open(environment.blockchain.proofBot+`/?type=pobl&txn=${to}&txn2=${from}`);
    });
    d3.selectAll("g.node").on('click', function (d: any) {
        window.open("/txn/" + Nodes[d].TrustLinks[0])
    });

  }

  addNodesAndEdges(g:any, Nodes:any, doneNodes:Array<string>, edgeValues:Array<number>, node:any, mainIndex:number, depth:number) {
    const {sColor, lColor, bColor} = this.getColorForTxnType(node.Data.TxnType);
    if(doneNodes.includes(node.Data.TxnHash)) return;
    if (node.Data.Identifier!=""){
        g.setNode(node.Data.TxnHash, {
            label: `Batch ID:  ${node.Data.Identifier}`,
            shape: 'rect',
            id:`node-${node.Data.TxnHash}-${sColor}`,
            style: `stroke: ${bColor}; stroke-width: 2.5px; fill: ${sColor}`,
            labelStyle: `font: 300 14px 'Helvetica Neue', Helvetica;fill: ${lColor}; cursor: pointer; font-weight: bold`,
        });
    }
    var lastSplitNodeIndex = null;
    if(node.Children) {
        for (let index = 0; index < node.Children.length; index++) {
            const child = node.Children[index];
            const childNode = Nodes[child];
            const colors = this.getColorForTxnType(childNode.Data.TxnType);
            var nodeIndex = null;
            var nodeDepth = depth;
            if (childNode.Data.TxnType == "6") {
                nodeDepth++;
                if(lastSplitNodeIndex) lastSplitNodeIndex = this.getEdgeIndexForTxnType(childNode.Data.TxnType, lastSplitNodeIndex, nodeDepth);
                else lastSplitNodeIndex = this.getEdgeIndexForTxnType(childNode.Data.TxnType, mainIndex, nodeDepth)
                nodeIndex = lastSplitNodeIndex;
                nodeDepth++;
            } else nodeIndex = this.getEdgeIndexForTxnType(childNode.Data.TxnType, mainIndex, nodeDepth);
            mainIndex = nodeIndex;
            g.setEdge(node.Data.TxnHash, childNode.Data.TxnHash, {
                label: `${this.getTxnNameForTxnType(childNode.Data.TxnType)}`,
                labelStyle: `font-size: 10px; fill: ${colors.sColor}; cursor: pointer; font-weight: bold`,
                curve: d3.curveBasis,
                style: `stroke: ${colors.sColor}; fill:none; stroke-width: 2px;`,
                arrowheadStyle: `fill: ${colors.sColor}`,
            });
            edgeValues.push(nodeIndex);
            this.addNodesAndEdges(g, Nodes, doneNodes, edgeValues, childNode, nodeIndex, nodeDepth);
        }
    }
    doneNodes.push(node.Data.TxnHash);
  }

  getColorForTxnType(type) {
    var sColor : string, lColor : string, bColor : string;
    switch (type) {
      case "0":
          sColor = "#16A085";
          bColor = "#086553";
          lColor = "white";
          break
      case "2":
          sColor = "#27AE60";
          bColor = "#127D40";
          lColor = "white";
          break
      case "6":
          sColor = "#2980B9";
          bColor = "#105481";
          lColor = "white";
          break
      case "7":
          sColor = "#C0392B";
          bColor = "#802C24";
          lColor = "white";
          break
      case "5":
          sColor = "#8E44AD";
          bColor = "#70318A";
          lColor = "white";
          break
      default:
          sColor = "black";
          bColor = "black";
          lColor = "white";
          break
    }
    return {sColor, lColor, bColor};
  }

  getTxnNameForTxnType(type) {
    switch (type) {
      case "0":
          return "GENESIS";
      case "2":
          return "TDP";
      case "6":
          return "SPLIT";
      case "7":
          return "MERGE";
      case "5":
          return "SPLIT PARENT";
      default:
    }
  }
  getEdgeIndexForTxnType(type:string, mainIndex: number, depth : number) : number{
    const suffix =  1 / Math.pow(10, depth);
    const final = mainIndex + suffix;
    return parseFloat(final.toFixed(depth));
    // switch (type) {
    //   case "0":
    //     return mainIndex + (1 / suffix);
    //   case "2":
    //     return mainIndex + (1 / suffix);
    //   case "6":
    //     return mainIndex + (1 / suffix);
    //   case "7":
    //     return mainIndex + (1 / suffix);
    // }
  }

  public getTransaction(passingHash: string) {
    this.pocTransactions.forEach((element) => {
      if (element.Txnhash == passingHash) {
        this.selectedItem = element;
      }
     });
  }

  createChild(data: any) {
    let index = data.length;
    let kkk: string = '{' + this.rec(data, index) + '}';
    return JSON.parse(kkk);
  }

  rec(data: any, index: number): string {
    index = index - 1;
    let str: string = '';
    if (index >= 1) {
      str = str.concat(this.rec(data, index));
    } else if (index == 0) {
      let val = '"id":"' + data[index].Txnhash + '"';
      str = str.concat(val);
      return str;
    }

    let val = '"id":"' + data[index].Txnhash + '",' + '"children":[{' + str + '}]';
    return val;
  }

  ngAfterViewInit() {
    window.addEventListener('message', this.handleMessage);
  }

  handleMessage = (event) => {
    if (event.data === 'clickButton') {
      alert("hi message")
      let button = document.getElementById('bps-poe');
      button.click();
    }
  };

  ngOnDestroy() {
    window.removeEventListener('message', this.handleMessage);
  }

}
