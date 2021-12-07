import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PococDataService } from '../../../services/pococ-data.service';
import { ITransactionCoc } from 'src/app/shared/models/transaction-coc.model';
import { ErrorMessage } from 'src/app/shared/models/error-message.model';
import {Location} from '@angular/common';
@Component({
  templateUrl: './proof-pococ.component.html',
  styleUrls: ['./proof-pococ.component.css']
})
export class ProofPococComponent implements OnInit {

  txnId: string;
  txnItem: ITransactionCoc;

  error: ErrorMessage;
  errorOccurred: boolean = false;
  loadingComplete: boolean = false;

  // Loader Variables

  color = "primary";
  mode = "indeterminate";
  value = 20;

  constructor(private route: ActivatedRoute, private pococDataService: PococDataService, private _location: Location) { }

  ngOnInit() {
    this.txnId = this.route.snapshot.paramMap.get('txnhash');
    this.getProofDataFromGateway(this.txnId);
  }

  goBack():void{
    this._location.back();
  } 

  getProofDataFromGateway(txnId: string) {
    this.pococDataService.getPococProofData(txnId).subscribe((data) => {
      this.loadingComplete = true;
      console.log("PoCoC Data: ", data);
      let element = data[0];

      if (element.TxnType != "coc") {
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
        proofStatus: element.Status,
        txnHash: element.Txnhash,
        txnUrl: element.Url,
        txnLabUrl:element.LabUrl,
        identifier: element.Identifier,
        blockchain: element.BlockchainName,
        timestamp: element.Timestamp,
        quantity: element.Quantity,
        assetCode: element.AssetCode,
        sender: element.From,
        receiver: element.To,
        senderSigned: element.FromSigned,
        receiverSigned: element.ToSigned,
        cocStatus: element.COCStatus,
        transferType: element.TxnType,
        sequence: element.SequenceNo,
        ledger: element.Ledger,
        fee: element.FeePaid,
        inputData: "Not Sending",
        availableProofs: ["Not Sending"]
      }

    }, (err) => {
      console.log("PoCoC Data Error: ", err);

      this.loadingComplete = true;

      if (err.status === 400) {
        this.errorOccurred = true;
        this.error = {
          errorTitle: "No matching results found",
          errorMessage: "There is no data associated with the given ID. Check if the entered ID is correct and try again.",
          errorMessageSecondary: "If you still don't see the results you were expecting, please let us know.",
          errorType: "empty"
        }
      } else {
        this.errorOccurred = true;
        this.error = {
          errorTitle: "Something went wrong",
          errorMessage: "An error occurred while retrieving data. Check if the entered ID is correct and try again in a while.",
          errorMessageSecondary: "If you still don't see the results you were expecting, please let us know.",
          errorType: "empty"
        }
      }
    });
  }

  copyToClipboard() {

  }

}
