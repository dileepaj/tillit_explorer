import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PocDataService } from '../../../services/poc-data.service';
import * as d3 from 'd3';
import { ErrorMessage } from '../../../shared/models/error-message.model';

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

  pocTransactions = [];
  selectedItem;

  // Loader Variables

  color = "primary";
  mode = "indeterminate";
  value = 20;

  constructor(private route: ActivatedRoute, private pocDataService: PocDataService) { }

  ngOnInit() {
    this.txnId = this.route.snapshot.paramMap.get('txnhash');
    this.getProofData(this.txnId);
  }

  getProofData(id: string) {
    this.pocDataService.getPocProofData(id).subscribe((data) => {
      console.log("PoC: ", data);

      this.loadingComplete = true;
      this.pocTransactions = data;
      this.selectedItem = this.pocTransactions[this.pocTransactions.length - 1];

      let results = this.createChild(data);
      this.graph(results);

    }, (err) => {
      this.loadingComplete = true;
      console.log("Get PoC data error: ", err);
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
      console.log("Error: ", err);
    };
  }

  graph(jsonVal) {
    // alert(d3.select('.chart').text());
    // var count = 0;
    let canvas = d3
      .select(".chart")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "500px")
      .append("g")
      .attr("transform", "translate(50,50)");

    let diagonal = d3.svg.diagonal().projection((d) => {
      return [d.y, d.x];
    });

    let tree = d3.layout.tree().size([400, 400]);

    console.log("Data: ", jsonVal);
    let nodes = tree.nodes(jsonVal);
    console.log(nodes);

    let links = tree.links(nodes);
    console.log("Links: ", links);

    // let test = nodes[0].children[0].y;
    // console.log("Test", test);

    // let diagonal2 = d3.svg
    //   .diagonal()
    //   .source({ x: nodes[0].children[0].y, y: nodes[0].children[0].x })
    //   .target({ x: 550, y: 175 });

    let node = canvas
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => {
        return "translate(" + d.y + "," + d.x + ")";
      });

    let circ = d3.selectAll(".node");
    circ.on('click',  (d) => {
      this.getTransaction(d.id);
    });

    node
      .append("circle")
      .attr("id", 1)
      .attr("class", "circle-hover")
      .attr("r", 10)
      .attr("fill", "steelblue");

    node.append("text").text((d: any) => {      
      console.log("Node Text: ", d);
      return d.id;
    }).attr("opacity", 0);

    canvas
      .selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ADADAD")
      .attr("d", diagonal);
  }

  public getTransaction(passingHash: string) {
    this.pocTransactions.forEach((element) => { 
      if (element.Txnhash == passingHash) {
        this.selectedItem = element;
      }
     });
    console.log(this.selectedItem);
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


}
