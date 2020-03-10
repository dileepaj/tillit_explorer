import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})

export class CardComponent implements OnInit {

  @Input() transactionData;

  constructor(private router: Router) { }

  ngOnInit() {

  }

  navigateToProof(proof: string) {
    if (proof == "pog") {
      this.router.navigate(['/pog', this.transactionData.txnHash]);
    } else if (proof == "poe") {
      this.router.navigate(['/poe', this.transactionData.tdpId]);
    } else if (proof == "pococ") {
      this.router.navigate(['/pococ', this.transactionData.txnHash]);
    } else if (proof == "poc") {
      this.router.navigate(['/poc', this.transactionData.txnHash]);
    }
  }
}
