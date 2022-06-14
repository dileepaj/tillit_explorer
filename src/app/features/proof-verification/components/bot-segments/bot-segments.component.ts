import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-bot-segments",
  templateUrl: "./bot-segments.component.html",
  styleUrls: ["./bot-segments.component.css"]
})
export class BotSegmentsComponent implements OnInit {
  @Input() SegmentNumber: number;
  @Input() steppers: any[];
  @Input() subSteppers: any[];
  @Output() backToStepFn = new EventEmitter();
  @Output() backToActionFn = new EventEmitter();
  @Input() lang: string = "en";

  constructor() {}

  ngOnInit() {}

  emitBackToStepFn(NO: number) {
    this.backToStepFn.emit(NO);
  }

  emitBackToActionFn(NO: number) {
    this.backToActionFn.emit(NO);
  }
}
