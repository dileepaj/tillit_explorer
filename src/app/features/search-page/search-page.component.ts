import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransactionDataService } from 'src/app/services/transaction-data.service';
import { map } from 'rxjs/operators';
import { IBase64 } from '../../shared/models/base64.model';
import { ITransactionTDP } from '../../shared/models/transaction-tdp.model';
import { ITransactionCoc } from '../../shared/models/transaction-coc.model';
import { ITransactionGenesis } from 'src/app/shared/models/transaction-genesis.model';
import { ErrorMessage } from 'src/app/shared/models/error-message.model';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit {

  searchId: string;
  results: any = [];
  errorOccurred: boolean = false;
  otherResultsAvailable: boolean = false;

  tdpObsCount: number = 0;
  tdpObsResCount: number = 0;
  tdpObsResolved: boolean = true;
  tdpErrorCount: number = 0;

  error: ErrorMessage;
  loadingComplete: boolean = false;

  // Loader Variables

  color = "primary";
  mode = "indeterminate";
  value = 20;

  constructor(private route: ActivatedRoute, private transactionDataService: TransactionDataService) { }

  ngOnInit() {

    this.route.params.subscribe((data) => {
      this.results = [];
      this.loadingComplete = false;
      this.searchId = data.id;
      this.search(this.searchId);
    });
  }

  search(id: string): void {
    this.transactionDataService.getTransactions(id).subscribe((transactions) => {
      console.log("Transactions: ", transactions);
      this.errorOccurred = false;
      transactions.forEach(element => {
        console.log("Blockchain: ", element);

        if (element.TxnType == "tdp") {

          // TEMP VALIDATION
          this.tdpObsResolved = false;
          this.tdpObsCount++;

          this.transactionDataService.getTracifiedDataPackets(element.TdpId).subscribe((base64Data: IBase64) => {
            this.tdpObsResCount++;
            let tdp = JSON.parse(atob(base64Data.data));
            console.log("Backend Data: ", tdp);

            if (Object.keys(tdp).length == 0) {
              this.tdpErrorCount++;
              console.log("Object Keys Validation");
              this.error = {
                errorTitle: "No matching results found",
                errorMessage: "There is no data associated with the given ID. Check if the entered ID is correct and try again.",
                errorMessageSecondary: "If you still don't see the results you were expecting, please let us know.",
                errorType: "empty"
              }

              if (this.tdpObsCount == this.tdpObsResCount) {
                this.loadingComplete = true;
                this.tdpObsResolved = true;

                if (this.error && this.tdpErrorCount == this.tdpObsCount && !this.otherResultsAvailable) {
                  this.errorOccurred = true;
                }

                console.log("Objecy Keys Obs resolved and Loading Complete");
              } else {
                console.log("Object Keys Not Resolved yet in Success ");
              }

              return;
            }

            let txnItem: ITransactionTDP = {
              status: element.Status,
              txnHash: element.Txnhash,
              transferType: element.TxnType,
              sequence: element.SequenceNo,
              txnUrl: element.Url,
              publickKey: element.SourceAccount,
              identifier: element.Identifier,
              timestamp: element.Timestamp,
              ledger: element.Ledger,
              fee: element.FeePaid,
              tdpId: element.TdpId,
              availableProofs: element.AvailableProof,

              productId: tdp.header.item.itemID,
              productName: tdp.header.item.itemName,
              stageId: tdp.header.stageID,
              images: [],
              dbHash: "Not Sending",
              bcHash: "Not Sending",
              blockchain: "Not Sending"
            }

            if (tdp.data.photos) {
              console.log("Photos Exist.");
              txnItem.images = tdp.data.photos;
            }
            console.log("Txn Item: ", txnItem);

            this.results.push(txnItem);

            if (this.tdpObsCount == this.tdpObsResCount) {
              this.loadingComplete = true;
              this.tdpObsResolved = true;

              if (this.error && this.tdpErrorCount == this.tdpObsCount && !this.otherResultsAvailable) {
                this.errorOccurred = true;
              }

              console.log("Obs resolved and Loading Complete");
            } else {
              console.log("Not Resolved yet in Success ");
            }

          }, (err) => {
            this.tdpErrorCount++;
            this.tdpObsResCount++;
            console.log("Backend Error: ", err);

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

            if (this.tdpObsCount == this.tdpObsResCount) {
              this.loadingComplete = true;
              this.tdpObsResolved = true;

              if (this.error && this.tdpErrorCount == this.tdpObsCount && !this.otherResultsAvailable) {
                this.errorOccurred = true;
              }

              console.log("Obs resolved and Loading Complete in Error ");
            } else {
              console.log("Not Resolved yet in Error ");
            }

          });
        } else if (element.TxnType == "genesis") {

          let txnItem: ITransactionGenesis = {
            status: element.Status,
            txnHash: element.Txnhash,
            transferType: element.TxnType,
            sequence: element.SequenceNo,
            txnUrl: element.Url,
            publicKey: element.SourceAccount,
            identifier: element.Identifier,
            timestamp: element.Timestamp,
            ledger: element.Ledger,
            fee: element.FeePaid,
            availableProofs: element.AvailableProof,

            productId: "Not Sending",
            productName: "Not Sending",
            blockchainName: "Not Sending"
          }

          this.results.push(txnItem);
          this.otherResultsAvailable = true;

        } else if (element.TxnType == "coc") {
          let txnItem: ITransactionCoc = {
            proofStatus: element.Status,
            txnHash: element.Txnhash,
            txnUrl: element.Url,
            identifier: element.Identifier,
            sender: element.From,
            receiver: element.To,
            timestamp: element.Timestamp,
            transferType: element.TxnType,
            sequence: element.SequenceNo,
            ledger: element.Ledger,
            fee: element.FeePaid,
            availableProofs: element.AvailableProof,

            assetCode: "Not Sending",
            quantity: 0,

            inputData: "Not Sending",
            blockchain: "Not Sending",
            cocStatus: "Not Sending",
            senderSigned: false,
            receiverSigned: false
          }

          this.results.push(txnItem);
          this.otherResultsAvailable = true;
          console.log("ELSE: ", txnItem);
        } else if (element.TxnType == "splitChild") {
          let txnItem = {
            proofStatus: element.Status,
            txnHash: element.Txnhash,
            transferType: element.TxnType,
            sequence: element.SequenceNo,
            txnUrl: element.Url,
            publicKey: element.SourceAccount,
            timestamp: element.Timestamp,
            ledger: element.Ledger,
            fee: element.FeePaid,
            availableProofs: element.AvailableProof,
            blockchainName: "Not Available",
            productId: "Not Available",
            productName: "Not Available",
            identifier: "Not Available"
          }
          this.results.push(txnItem);
          this.otherResultsAvailable = true;
        } else if (element.TxnType == "splitParent") {
          let txnItem = {
            proofStatus: element.Status,
            txnHash: element.Txnhash,
            transferType: element.TxnType,
            sequence: element.SequenceNo,
            txnUrl: element.Url,
            publicKey: element.SourceAccount,
            timestamp: element.Timestamp,
            ledger: element.Ledger,
            fee: element.FeePaid,
            availableProofs: element.AvailableProof,
            blockchainName: "Not Available",
            productId: "Not Available",
            productName: "Not Available",
            identifier: "Not Available"
          }

          this.results.push(txnItem);
          this.otherResultsAvailable = true;
          console.log("ELSE: ", txnItem);
        }
      });

      if (this.otherResultsAvailable) {
        this.loadingComplete = true;
      } else if (!this.otherResultsAvailable && this.error && this.tdpErrorCount == this.tdpObsCount) {
        this.loadingComplete = true;
        this.errorOccurred = true;
      } else if (!this.otherResultsAvailable && this.error && this.tdpErrorCount != this.tdpObsCount) {
        this.loadingComplete = true;
      } else {
        this.loadingComplete = true;
      }

    }, (err) => {
      console.log("Blockchain Error: ", err);
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