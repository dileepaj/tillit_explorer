import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-verification-screen",
  templateUrl: "./verification-screen.component.html",
  styleUrls: ["./verification-screen.component.css"]
})
export class VerificationScreenComponent implements OnInit {
  // isTheater: boolean = false;
  // routerParams: any = {};
  // proofType: string = "";

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // this.route.queryParamMap.subscribe(params => {
    //   this.routerParams = { ...params.keys, ...params };
    // });
    // if (this.routerParams && this.routerParams.params) {
    // this.isTheater = this.routerParams.params.theater;
    //   this.proofType = this.routerParams.params.type;
    // }
  }
}
