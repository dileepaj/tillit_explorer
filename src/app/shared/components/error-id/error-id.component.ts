import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-error-id',
  templateUrl: './error-id.component.html',
  styleUrls: ['./error-id.component.css']
})
export class ErrorIdComponent implements OnInit {

  @Input() errorType: string;
  @Input() errorTitle: string;
  @Input() errorMessage: string;
  @Input() errorMessageSecondary: string;
  errorImage: string;

  constructor() { }

  ngOnInit() {
    if (this.errorType == "error") {
      this.errorImage = "../../../../assets/img/error-occured.png";
    } else if (this.errorType == "empty") {
      this.errorImage = "../../../../assets/img/no-results.png";
    }
  }

}
