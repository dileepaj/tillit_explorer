import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-bot-globaldata',
  templateUrl: './bot-globaldata.component.html',
  styleUrls: ['./bot-globaldata.component.css']
})
export class BotGlobaldataComponent implements OnInit {

  @Input() globalData: object[];
  @Input() gsOverflowX: string;

  constructor() {}

  ngOnInit() {}

}
