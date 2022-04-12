import { Component, Input, OnInit, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "app-bot-header",
  templateUrl: "./bot-header.component.html",
  styleUrls: ["./bot-header.component.css"]
})
export class BotHeaderComponent implements OnInit {
  @Input() lang: string;
  @Input() isPause: Boolean;
  @Input() ProofContainerTitle: string;
  @Input() isPlayCompleted: Boolean;
  @Input() currentStep: number;
  @Input() totalSteps: number;
  @Input() playbackSpeed: number;
  @Input() isTheater: Boolean;
  @Input() vsHeightExpand: Boolean;
  @Output() setLangFn = new EventEmitter();
  @Output() togglePlayPauseFn = new EventEmitter();
  @Output() stopFn = new EventEmitter();
  @Output() replayFn = new EventEmitter();
  @Output() setSpeedFn = new EventEmitter();
  @Output() theaterModeFn = new EventEmitter();
  @Output() resizeVerifyScreenFn = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  emitLangFn(lang: string) {
    this.setLangFn.emit(lang);
  }

  emitTogglePlayPauseFn() {
    this.togglePlayPauseFn.emit("");
  }

  emitStopFn() {
    this.stopFn.emit("");
  }

  emitReplayFn() {
    this.replayFn.emit("");
  }

  emitSetSpeedFn(speed: number) {
    this.setSpeedFn.emit(speed);
  }

  emitTheaterModeFn() {
    this.theaterModeFn.emit("");
  }

  emitResizeVerifyScreenFn() {
    this.resizeVerifyScreenFn.emit("");
  }
}
