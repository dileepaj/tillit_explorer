import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'proof-global-storage',
  templateUrl: './global-storage.component.html',
  styleUrls: ['./global-storage.component.css']
})
export class GlobalStorageComponent implements OnInit {

  @Input() frameData: object = {};

  constructor() { }

  ngOnInit() {
  }

}
