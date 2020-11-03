import { Component, OnInit } from '@angular/core';
import { TransactionDataService } from '../../services/transaction-data.service';
import { ITransactionTDP } from '../../shared/models/transaction-tdp.model';
import { IBase64 } from '../../shared/models/base64.model';
import { ITransactionCoc } from '../../shared/models/transaction-coc.model';
import { ITransactionGenesis } from '../../shared/models/transaction-genesis.model';
import { ErrorMessage } from 'src/app/shared/models/error-message.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  results: any = [];
  loadingComplete: boolean = false;
  errorOccurred: boolean = false;
  otherResultsAvailable: boolean = false;

  tdpObsCount: number = 0;
  tdpObsResCount: number = 0;
  tdpObsResolved: boolean = true;
  tdpErrorCount: number = 0;

  error: ErrorMessage;


  // Loader Variables

  color = "primary";
  mode = "indeterminate";
  value = 20;

  constructor(private transactionDataService: TransactionDataService) {

  }

  ngOnInit() {
    this.getRecentTransactions();
  }

  getRecentTransactions() {
    this.transactionDataService.getRecentTransactions(5).subscribe((transactions) => {
      // this.loadingComplete = true;
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
                errorTitle: "No recent transactions found",
                errorMessage: "There are no recent transactions to be loaded. Please try again in a little while.",
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

            let index = element.AvailableProof.findIndex((proof) => {
              return proof == "poc";
            });

            if (index != -1) {
              element.AvailableProof.splice(index, 1);
            }

            let txnItem: ITransactionTDP = {
              status: element.Status,
              txnHash: element.Txnhash,
              txnUrl: element.Url,
              identifier: element.Identifier,
              timestamp: element.Timestamp,
              transferType: element.TxnType,
              sequence: element.SequenceNo,
              publickKey: element.SourceAccount,
              ledger: element.Ledger,
              fee: element.FeePaid,
              tdpId: element.TdpId,
              availableProofs: element.AvailableProof,
              productId: tdp.header.item.itemID,
              productName: tdp.header.item.itemName,
              stageId: tdp.header.stageID,
              images: [],
              dbHash: "Not Available",
              bcHash: "Not Available",
              blockchain: "Not Available"
            }

            if (tdp.data.photos) {
              console.log("Photos Exist.");
              txnItem.images = tdp.data.photos;
            }

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
            console.log("Backend Error: ", err);
            this.tdpErrorCount++;
            this.tdpObsResCount++;
            if (err.status === 400) {
              this.error = {
                errorTitle: "No matching results found",
                errorMessage: "There is no data associated with the given ID. Check if the entered ID is correct and try again.",
                errorMessageSecondary: "If you still don't see the results you were expecting, please let us know.",
                errorType: "empty"
              }
            } else {
              this.error = {
                errorTitle: "No Transactions",
                errorMessage: "Currently there aren't any transactions to be shown. Please try again later.",
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

          let index = element.AvailableProof.findIndex((proof) => {
            return proof == "poc";
          });

          if (index != -1) {
            element.AvailableProof.splice(index, 1);
          }

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
            blockchainName: "Not Available",
            productId: "Not Available",
            productName: "Product Name Not Available"
          }

          this.results.push(txnItem);
          this.otherResultsAvailable = true;

        } else if (element.TxnType == "coc") {

          let index = element.AvailableProof.findIndex((proof) => {
            return proof == "poc";
          });

          if (index != -1) {
            element.AvailableProof.splice(index, 1);
          }

          let txnItem: ITransactionCoc = {
            proofStatus: element.Status,
            txnHash: element.Txnhash,
            transferType: element.TxnType,
            sequence: element.SequenceNo,
            txnUrl: element.Url,
            sender: element.From,
            receiver: element.To,
            identifier: element.Identifier,
            timestamp: element.Timestamp,
            ledger: element.Ledger,
            fee: element.FeePaid,
            availableProofs: element.AvailableProof,

            quantity: element.Quantity,
            assetCode: element.AssetCode,

            senderSigned: false,
            receiverSigned: false,
            cocStatus: "Not Available",
            inputData: "Not Available",
            blockchain: "Not Available"
          }
          this.results.push(txnItem);
          this.otherResultsAvailable = true;
        } else if (element.TxnType == "splitChild") {

          let index = element.AvailableProof.findIndex((proof) => {
            return proof == "poc";
          });

          if (index != -1) {
            element.AvailableProof.splice(index, 1);
          }

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
            productId: "Product ID Not Available",
            productName: "Product Name Not Available",
            identifier: "Not Available"
          }
          this.results.push(txnItem);
          this.otherResultsAvailable = true;
        } else if (element.TxnType == "splitParent") {

          let index = element.AvailableProof.findIndex((proof) => {
            return proof == "poc";
          });

          if (index != -1) {
            element.AvailableProof.splice(index, 1);
          }

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
            productId: "Product ID Not Available",
            productName: "Product Name Not Available",
            identifier: "Not Available"
          }
          this.results.push(txnItem);
          this.otherResultsAvailable = true;
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
          errorTitle: "No Transactions",
          errorMessage: "Currently there aren't any transactions to be shown. Please try again later.",
          errorMessageSecondary: "If you still don't see the results you were expecting, please let us know.",
          errorType: "empty"
        }
      }

    });
  }

}
