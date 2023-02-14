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

  // Loader Variables

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
    this,this.renderGraph(this.getData().Nodes)
    // this.pocDataService.getPocTreeData(id).subscribe((data) => {
    //   this.loadingComplete = true;
    //   this.renderGraph(data.Nodes);
    //  }, (err)=> {
    // })
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
    this.pocTreeWidth = width;
    this.pocTreeHeight = height;
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
        if(Nodes[d.w].Data.TxnType == 2)
            window.open(environment.blockchain.proofBot+`/?type=pobl&txn=${to}&txn2=${from}`);
        else alert("At the moment, proof verification is only available for TDPs.")
    });
    d3.selectAll("g.node").on('click', function (d: any) {
        window.open("/txn/" + Nodes[d].TrustLinks[0])
    });

  }

  addNodesAndEdges(g:any, Nodes:any, doneNodes:Array<string>, edgeValues:Array<number>, node:any, mainIndex:number, depth:number) {
    const {sColor, lColor} = this.getColorForTxnType(node.Data.TxnType);
    if(doneNodes.includes(node.Data.TxnHash)) return;
    if (node.Data.Identifier!=""){
        g.setNode(node.Data.TxnHash, {
            label: node.Data.Identifier,
            shape: 'rect',
            id:`node-${node.Data.TxnHash}-${sColor}`,
            style: `stroke: black; stroke-width: 1px; fill: ${sColor}`,
            labelStyle: `font: 300 14px 'Helvetica Neue', Helvetica;fill: ${lColor}; cursor: pointer;`,
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
                label: `${nodeIndex} ${this.getTxnNameForTxnType(childNode.Data.TxnType)}`,
                labelStyle: `font-size: 10px; fill: ${colors.sColor}; cursor: pointer;`,
                curve: d3.curveBasis,
                style: `stroke: ${colors.sColor}; fill:none; stroke-width: 1.9px; stroke-dasharray: 5, 5;`,
                arrowheadStyle: `fill: ${colors.sColor}`,
            });
            edgeValues.push(nodeIndex);
            this.addNodesAndEdges(g, Nodes, doneNodes, edgeValues, childNode, nodeIndex, nodeDepth);
        }
    }
    doneNodes.push(node.Data.TxnHash);
  }

  getColorForTxnType(type) {
    var sColor : string, lColor : string;
    switch (type) {
      case "0":
          sColor = "brown";
          lColor = "white";
          break
      case "2":
          sColor = "green";
          lColor = "white";
          break
      case "6":
          sColor = "purple";
          lColor = "white";
          break
      case "7":
          sColor = "red";
          lColor = "white";
          break
      default:
          sColor = "white";
          lColor = "black";
          break
    }
    return {sColor, lColor};
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

  getData() {
    this.loadingComplete = true;
return {
  "TxnHash": "df02969e5c84963db31b1375e257d868093fd06d7e3e7b6c2c8ee2d9235f0431",
  "LastTxnHash": "8807fc8db14ef1c1d0692766d12e1b4cd0afe240e41c1a3614c37046a0335840",
  "Level": 6,
  "Nodes": {
      "3be8cdaf2dd0dafa2b753c40434eb294385ce2b64c845b77b252b4d69a248bcc": {
          "Id": "3be8cdaf2dd0dafa2b753c40434eb294385ce2b64c845b77b252b4d69a248bcc",
          "Data": {
              "Identifier": "Blog1",
              "RealIdentifier": "",
              "TdpId": "",
              "SequenceNo": 61538291417312,
              "ProfileID": "",
              "TxnHash": "3be8cdaf2dd0dafa2b753c40434eb294385ce2b64c845b77b252b4d69a248bcc",
              "PreviousTxnHash": "",
              "FromIdentifier1": "",
              "FromIdentifier2": "",
              "ToIdentifier": "",
              "MapIdentifier1": "",
              "MapIdentifier2": "",
              "MapIdentifier": "",
              "ItemCode": "",
              "ItemAmount": "",
              "PublicKey": "GAUAUCASNMVAZ4VWBZUTEGHK2EBKN3E3ECSQ6CES2IRGITVGYVSAZGBD",
              "TxnType": "2",
              "XDR": "AAAAAgAAAAAoCggSayoM8rYOaTIY6tECpuybIKUPCJLSImROpsVkDAAJJ8AAADf4AAAA4AAAAAAAAAAAAAAABgAAAAAAAAAKAAAABFR5cGUAAAABAAAAATIAAAAAAAAAAAAACgAAAAtwcm9kdWN0TmFtZQAAAAABAAAABnBhcGF5YQAAAAAAAAAAAAoAAAAJcHJvZHVjdElkAAAAAAAAAQAAABg2MjY4ZTljMTAzYjFkMjVkM2NhYjg2NWUAAAAAAAAACgAAAApJZGVudGlmaWVyAAAAAAABAAAACDY0Mjc5NzI3AAAAAAAAAAoAAAAIZGF0YUhhc2gAAAABAAAAQDZhYzgyMWZkMTJiOGMxOTk3M2Q2OGU2ZTkyMzk2NjdiNmRjZWQ2ZWQxOWZjMDhjYzZhMDhhZDg5ZWE4NjkxNTMAAAABAAAAAIpriNst3RPs68NXUGCpfHZov85ZTzM7zng6oAcEpI2AAAAACgAAAAphcHBBY2NvdW50AAAAAAABAAAAOEdDRkdYQ0czRlhPUkgzSExZTkxWQVlGSlBSM0dSUDZPTEZIVEdPNk9QQTVLQUJZRVVTR1lBSVZRAAAAAAAAAAKmxWQMAAAAQKWjrA3dMr7ZRM0rmUX+fG+1PnC4+eVMlyxVnj1tQgh19S6mTIpdGueo/SgeMjoHS+PFmMgA4KWXekSBDh7uWQwEpI2AAAAAQOblWES5MDLpBbA+uJVPq+Izuanw3qBaXCMrrwhnneDvcplF0bmZZs4gH3pA8Oiiw1WHc0xwHm22jxookwAVdA0=",
              "Status": "stellar-test",
              "MergeID": "",
              "Orphan": false,
              "PreviousStage": "",
              "CurrentStage": "",
              "AppAccount": "GCFGXCG3FXORH3HLYNLVAYFJPR3GRP6OLFHTGO6OPA5KABYEUSGYAIVQ",
              "DataHash": "6ac821fd12b8c19973d68e6e9239667b6dced6ed19fc08cc6a08ad89ea869153",
              "ProductName": "papaya",
              "ProductID": "6268e9c103b1d25d3cab865e",
              "PreviousSplitProfile": "",
              "CurrentTxnHash": "",
              "PreviousTxnHash2": ""
          },
          "Parents": [
              "90c993e68c005d20a93f4632a8a1f0fe4d6b03edce12b123bb6dc390a183aefb"
          ],
          "Children": [
              "47bc672375f7c713f16fe2ce8af006fbe57fe07165cd3e949dc521a4e3b11952",
              "7705b9576c52883f8de911151c62070f8353943d485ef84a2abd15dfe1c86169"
          ],
          "Siblings": null,
          "TrustLinks": [
              "25ca2d8788bd41fe677de1f7ac637423198be378723fb550e4138902d0da8509"
          ]
      },
      "47bc672375f7c713f16fe2ce8af006fbe57fe07165cd3e949dc521a4e3b11952": {
          "Id": "47bc672375f7c713f16fe2ce8af006fbe57fe07165cd3e949dc521a4e3b11952",
          "Data": {
              "Identifier": "Blog1M",
              "RealIdentifier": "",
              "TdpId": "",
              "SequenceNo": 61538291417316,
              "ProfileID": "",
              "TxnHash": "47bc672375f7c713f16fe2ce8af006fbe57fe07165cd3e949dc521a4e3b11952",
              "PreviousTxnHash": "",
              "FromIdentifier1": "64279727",
              "FromIdentifier2": "1643310799",
              "ToIdentifier": "",
              "MapIdentifier1": "",
              "MapIdentifier2": "",
              "MapIdentifier": "",
              "ItemCode": "6268e9c103b1d25d3cab865e",
              "ItemAmount": "0",
              "PublicKey": "GAUAUCASNMVAZ4VWBZUTEGHK2EBKN3E3ECSQ6CES2IRGITVGYVSAZGBD",
              "TxnType": "7",
              "XDR": "AAAAAgAAAAAoCggSayoM8rYOaTIY6tECpuybIKUPCJLSImROpsVkDAAMNQAAADf4AAAA5AAAAAAAAAAAAAAACAAAAAAAAAAKAAAABFR5cGUAAAABAAAAATcAAAAAAAAAAAAACgAAAApJZGVudGlmaWVyAAAAAAABAAAACjE5OTI2NzE2MTQAAAAAAAAAAAAKAAAAD0Zyb21JZGVudGlmaWVyMQAAAAABAAAACDY0Mjc5NzI3AAAAAAAAAAoAAAAPRnJvbUlkZW50aWZpZXIyAAAAAAEAAAAKMTY0MzMxMDc5OQAAAAAAAAAAAAoAAAAJQXNzZXRDb2RlAAAAAAAAAQAAABg2MjY4ZTljMTAzYjFkMjVkM2NhYjg2NWUAAAAAAAAACgAAAAtBc3NldEFtb3VudAAAAAABAAAAATAAAAAAAAABAAAAAIpriNst3RPs68NXUGCpfHZov85ZTzM7zng6oAcEpI2AAAAACgAAAAphcHBBY2NvdW50AAAAAAABAAAAOEdDRkdYQ0czRlhPUkgzSExZTkxWQVlGSlBSM0dSUDZPTEZIVEdPNk9QQTVLQUJZRVVTR1lBSVZRAAAAAAAAAAoAAAALcHJvZHVjdE5hbWUAAAAAAQAAAAZwYXBheWEAAAAAAAAAAAACpsVkDAAAAEAP+pk6oZ9ZWgSuQDN1oO4EJJlDVmUqz6DJ/Ln/ewH2UqpLU/3B47lXVCN/ri2UN7An5YOg02tFJaxhGA9sX68ABKSNgAAAAECZ3/r/Imxx+fhK5ZChv822QlfNqYdVoC3Uc9gyGw1EGu6Je7mNreeiV92CpbEK1C578bA5eF13lNgHGOgwazEH",
              "Status": "stellar-test",
              "MergeID": "",
              "Orphan": false,
              "PreviousStage": "",
              "CurrentStage": "",
              "AppAccount": "GCFGXCG3FXORH3HLYNLVAYFJPR3GRP6OLFHTGO6OPA5KABYEUSGYAIVQ",
              "DataHash": "",
              "ProductName": "papaya",
              "ProductID": "",
              "PreviousSplitProfile": "",
              "CurrentTxnHash": "",
              "PreviousTxnHash2": ""
          },
          "Parents": [
              "7705b9576c52883f8de911151c62070f8353943d485ef84a2abd15dfe1c86169",
              "3be8cdaf2dd0dafa2b753c40434eb294385ce2b64c845b77b252b4d69a248bcc"
          ],
          "Children": null,
          "Siblings": null,
          "TrustLinks": [
              "df02969e5c84963db31b1375e257d868093fd06d7e3e7b6c2c8ee2d9235f0431"
          ]
      },
      "7705b9576c52883f8de911151c62070f8353943d485ef84a2abd15dfe1c86169": {
          "Id": "7705b9576c52883f8de911151c62070f8353943d485ef84a2abd15dfe1c86169",
          "Data": {
              "Identifier": "BlogSS1",
              "RealIdentifier": "",
              "TdpId": "",
              "SequenceNo": 61538291417314,
              "ProfileID": "",
              "TxnHash": "7705b9576c52883f8de911151c62070f8353943d485ef84a2abd15dfe1c86169",
              "PreviousTxnHash": "",
              "FromIdentifier1": "64279727",
              "FromIdentifier2": "",
              "ToIdentifier": "",
              "MapIdentifier1": "",
              "MapIdentifier2": "",
              "MapIdentifier": "",
              "ItemCode": "6268e9c103b1d25d3cab865e",
              "ItemAmount": "0",
              "PublicKey": "GAUAUCASNMVAZ4VWBZUTEGHK2EBKN3E3ECSQ6CES2IRGITVGYVSAZGBD",
              "TxnType": "6",
              "XDR": "AAAAAgAAAAAoCggSayoM8rYOaTIY6tECpuybIKUPCJLSImROpsVkDAAKrmAAADf4AAAA4gAAAAAAAAAAAAAABwAAAAAAAAAKAAAABFR5cGUAAAABAAAAATYAAAAAAAAAAAAACgAAAApJZGVudGlmaWVyAAAAAAABAAAACjE2NDMzMTA3OTkAAAAAAAAAAAAKAAAADkZyb21JZGVudGlmaWVyAAAAAAABAAAACDY0Mjc5NzI3AAAAAAAAAAoAAAAJQXNzZXRDb2RlAAAAAAAAAQAAABg2MjY4ZTljMTAzYjFkMjVkM2NhYjg2NWUAAAAAAAAACgAAAAtBc3NldEFtb3VudAAAAAABAAAAATAAAAAAAAAAAAAACgAAAAtwcm9kdWN0TmFtZQAAAAABAAAABnBhcGF5YQAAAAAAAQAAAACKa4jbLd0T7OvDV1BgqXx2aL/OWU8zO854OqAHBKSNgAAAAAoAAAAKYXBwQWNjb3VudAAAAAAAAQAAADhHQ0ZHWENHM0ZYT1JIM0hMWU5MVkFZRkpQUjNHUlA2T0xGSFRHTzZPUEE1S0FCWUVVU0dZQUlWUQAAAAAAAAACpsVkDAAAAEAhGMjt9NRk1XkzaGWOW9OsQv9jL6wvFESnuPc65Zzae2/kH2oXjhr5YiRx+PqtxvQwxtgR4Bv6MYmSyNFDz+4KBKSNgAAAAECka2OthmBzQae1juLRaA+zXlBkzIULNNS9uDnINheca75MaRE/HGTkYuouJ09r7WX40mBqh+yIgb4Nura5JLkH",
              "Status": "stellar-test",
              "MergeID": "",
              "Orphan": false,
              "PreviousStage": "",
              "CurrentStage": "",
              "AppAccount": "GCFGXCG3FXORH3HLYNLVAYFJPR3GRP6OLFHTGO6OPA5KABYEUSGYAIVQ",
              "DataHash": "",
              "ProductName": "papaya",
              "ProductID": "",
              "PreviousSplitProfile": "",
              "CurrentTxnHash": "",
              "PreviousTxnHash2": ""
          },
          "Parents": [
              "3be8cdaf2dd0dafa2b753c40434eb294385ce2b64c845b77b252b4d69a248bcc"
          ],
          "Children": [
              "47bc672375f7c713f16fe2ce8af006fbe57fe07165cd3e949dc521a4e3b11952"
          ],
          "Siblings": null,
          "TrustLinks": [
              "4854bfa530f579e75a380fa7ec8848db6429ee2f77e93e6e211c2a44471e8cc0"
          ]
      },
      "90c993e68c005d20a93f4632a8a1f0fe4d6b03edce12b123bb6dc390a183aefb": {
          "Id": "90c993e68c005d20a93f4632a8a1f0fe4d6b03edce12b123bb6dc390a183aefb",
          "Data": {
              "Identifier": "Blog1",
              "RealIdentifier": "",
              "TdpId": "",
              "SequenceNo": 61538291417311,
              "ProfileID": "",
              "TxnHash": "90c993e68c005d20a93f4632a8a1f0fe4d6b03edce12b123bb6dc390a183aefb",
              "PreviousTxnHash": "",
              "FromIdentifier1": "",
              "FromIdentifier2": "",
              "ToIdentifier": "",
              "MapIdentifier1": "",
              "MapIdentifier2": "",
              "MapIdentifier": "",
              "ItemCode": "",
              "ItemAmount": "",
              "PublicKey": "GAUAUCASNMVAZ4VWBZUTEGHK2EBKN3E3ECSQ6CES2IRGITVGYVSAZGBD",
              "TxnType": "0",
              "XDR": "AAAAAgAAAAAoCggSayoM8rYOaTIY6tECpuybIKUPCJLSImROpsVkDAAHoSAAADf4AAAA3wAAAAAAAAAAAAAABQAAAAAAAAAKAAAABFR5cGUAAAABAAAAATAAAAAAAAAAAAAACgAAAApJZGVudGlmaWVyAAAAAAABAAAACDY0Mjc5NzI3AAAAAAAAAAoAAAALcHJvZHVjdE5hbWUAAAAAAQAAAAZwYXBheWEAAAAAAAAAAAAKAAAACXByb2R1Y3RJZAAAAAAAAAEAAAAYNjI2OGU5YzEwM2IxZDI1ZDNjYWI4NjVlAAAAAQAAAACKa4jbLd0T7OvDV1BgqXx2aL/OWU8zO854OqAHBKSNgAAAAAoAAAAKYXBwQWNjb3VudAAAAAAAAQAAADhHQ0ZHWENHM0ZYT1JIM0hMWU5MVkFZRkpQUjNHUlA2T0xGSFRHTzZPUEE1S0FCWUVVU0dZQUlWUQAAAAAAAAACpsVkDAAAAEBgiRG5NifVV1sFbloQlI2WFzLcubg4Muin66cijNrf9UpWgd+SJ7/g+DGyLgCyiV56cV7SHQjEVkuO4+GwZPECBKSNgAAAAED6rhWdEf17KF7PBvh+Kdh1DUNd0eNVmfsISa7jV+3IlIl8M6iZR+zpTCZSC7sbi2hgdT3T/GFba3EalBrOJtsG",
              "Status": "stellar-test",
              "MergeID": "",
              "Orphan": false,
              "PreviousStage": "",
              "CurrentStage": "",
              "AppAccount": "GCFGXCG3FXORH3HLYNLVAYFJPR3GRP6OLFHTGO6OPA5KABYEUSGYAIVQ",
              "DataHash": "",
              "ProductName": "papaya",
              "ProductID": "6268e9c103b1d25d3cab865e",
              "PreviousSplitProfile": "",
              "CurrentTxnHash": "",
              "PreviousTxnHash2": ""
          },
          "Parents": null,
          "Children": [
              "3be8cdaf2dd0dafa2b753c40434eb294385ce2b64c845b77b252b4d69a248bcc",
          ],
          "Siblings": null,
          "TrustLinks": [
              "8807fc8db14ef1c1d0692766d12e1b4cd0afe240e41c1a3614c37046a0335840"
          ]
      }
  }
}
  }

}
