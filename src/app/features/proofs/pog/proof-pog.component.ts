import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PogDataService } from '../../../services/pog-data.service';
import { ITransactionGenesis } from 'src/app/shared/models/transaction-genesis.model';
import { ErrorMessage } from 'src/app/shared/models/error-message.model';
import {Location} from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './proof-pog.component.html',
  styleUrls: ['./proof-pog.component.css']
})
export class ProofPogComponent {

  txnId: string;
  txnItem: ITransactionGenesis;

  loadingComplete: boolean = false;

  error: ErrorMessage;
  errorOccurred: boolean = false;

  // Loader Variables

  color = "primary";
  mode = "indeterminate";
  value = 20;
  proofbotDomain=environment.blockchain.proofBot
  botHash:string

  constructor(private route: ActivatedRoute, private pogDataService: PogDataService, private _location: Location) { }

  ngOnInit() {
    this.botHash= history.state.botHash
    this.txnId = this.route.snapshot.paramMap.get('txnhash');
    this.getProofData(this.txnId);
  }

  goBack():void{
    this._location.back();
    }  

  getProofData(txnID: string) {
    this.pogDataService.getPogProofData(txnID).subscribe((data) => {
      this.loadingComplete = true;
      let element = data[0];
    //  console.log("PoG Data: ", data);

      if (element.TxnType != "genesis") {
        this.errorOccurred = true;
        this.error = {
          errorTitle: "Invalid Proof Type",
          errorMessage: "Proof type is not associated with the current ID. Check if the entered ID is correct and try again.",
          errorMessageSecondary: "If you still don't see the results you were expecting, please let us know.",
          errorType: "empty"
        }
        return;
      }

      this.txnItem = {
        status: element.Status,
        txnHash: element.Txnhash,
        txnUrl: element.Url,
        txnLabUrl:element.LabUrl,
        identifier: element.Identifier,
        timestamp: element.Timestamp,
        blockchainName: element.BlockchainName,
        transferType: element.TxnType,
        sequence: element.SequenceNo,
        publicKey: element.SourceAccount,
        ledger: element.Ledger,
        fee: element.FeePaid,
        availableProofs: [],
        productId: element.ProductId,
        productName:( element.CreatedAt !=" " &&  element.ProductName) ? atob(element.ProductName) :  element.ProductName,
      }
    }, (err) => {
    //  console.log("Get PoG Proof Error: ", err);
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
    });
  }

}
