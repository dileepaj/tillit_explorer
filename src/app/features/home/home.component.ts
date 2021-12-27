import { Component, OnInit } from '@angular/core';
import { TransactionDataService } from '../../services/transaction-data.service';
import { ITransactionTDP } from '../../shared/models/transaction-tdp.model';
import { IBase64 } from '../../shared/models/base64.model';
import { ITransactionCoc } from '../../shared/models/transaction-coc.model';
import { ITransactionGenesis } from '../../shared/models/transaction-genesis.model';
import { ErrorMessage } from 'src/app/shared/models/error-message.model';
import { encode, decode } from 'js-base64';

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
  page:number = 1;
  perPage:number = 10;
  NoPage:number = 3;
  // Loader Variables
  color = "primary";
  mode = "indeterminate";
  value = 20;
  constructor(private transactionDataService: TransactionDataService) {}
  ngOnInit() {
    this.getRecentTransactions();
  }
  onChangePage(event:number){
    this.page = event
    this.results = []
    this.loadingComplete = false;
    this.getRecentTransactions();
  }
  getRecentTransactions() {
    this.transactionDataService.getRecentTransactions(this.page, this.perPage, this.NoPage).subscribe((transactions) => {
      // this.loadingComplete = true;
      console.log("Blockchain: ", !!transactions);
      if(!!transactions){
      transactions.forEach(element => {
        //console.log("Blockchain: ", element);
        if (element.TxnType == "tdp") {

          let index = element.AvailableProof.findIndex((proof) => {
            return proof == "poc";
          });

          if (index != -1) {
            element.AvailableProof.splice(index, 1);
          }

          let txnItem = {
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
            availableProofs: element.AvailableProof,
            BlockchainName: "Stellar",
            productId: "Not Available",
            productName: element.ProductName
          }

          this.results.push(txnItem);
          this.otherResultsAvailable = true;

        } 
        else if (element.TxnType == "genesis") {
          let index = element.AvailableProof.findIndex((proof) => {
            return proof == "poc";
          });
          if (index != -1) {
            element.AvailableProof.splice(index, 1);
          }
          let txnItem = {
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
            BlockchainName: "Stellar",
            productId: "Not Available",
            productName: element.ProductName
          }
          this.results.push(txnItem);
          this.otherResultsAvailable = true;
        }      
        else if (element.TxnType == "coc") {
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
            BlockchainName: "Stellar",
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
            BlockchainName: "Stellar",
            productId: "Product ID Not Available",
            productName: element.ProductName,
            identifier: "Not Available"
          }
          this.results.push(txnItem);
          this.otherResultsAvailable = true;
        } 
        
  
        else if (element.TxnType == "splitParent") {

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
            BlockchainName: "Stellar",
            productId: "Product ID Not Available",
            productName: element.ProductName,
            identifier: "Not Available"
          }
          this.results.push(txnItem);
          this.otherResultsAvailable = true;
        }
      })}else{ 
        this.loadingComplete = true;
        this.errorOccurred = true;
        this.error = {
          errorTitle: "No matching results found",
          errorMessage: "Transaction could not be retrieved from Stellar Network",
          errorMessageSecondary: "Please try again later",
          errorType: "empty"
        }
      }
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
    // console.log("Blockchain Error: ", err);
      this.loadingComplete = true;
      this.errorOccurred = true;
      if (err.error.code === 400) {
        this.error = {
          errorTitle: "No matching results found",
          errorMessage:  "We can not find the requested records in Stellar blockchain",
          errorMessageSecondary: "Please try again later",
          errorType: "empty"
        }
      }
      else if(err.error.code === 500){
        this.error = {
          errorTitle: "Internal server error",
          errorMessage:  "We can not find the requested records in Stellar blockchain",
          errorMessageSecondary: "Please try again later",
          errorType: "empty"
        }
      } else {
        this.error = {
          errorTitle: "No matching results found",
          errorMessage: "We can not find the requested records in Stellar blockchain",
          errorMessageSecondary: "Check if the entered ID is correct and try again.",
          errorType: "empty"
        }
      }
    });
  }
}
