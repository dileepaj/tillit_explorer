import { Component, OnInit } from '@angular/core';
import { TransactionDataService } from '../../services/transaction-data.service';
import { ErrorMessage } from 'src/app/shared/models/error-message.model';
import { Observable, Subscription, timer } from 'rxjs';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  results: any = [];
  results1:any=[];
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
  totalRecords:number=0;
  subscription: Subscription;

  constructor(private transactionDataService: TransactionDataService) {}
  ngOnInit() {
    this.getRecentTransactionsCount()
    window.onunload = function () {
      sessionStorage.clear();
    }

    this.addResultToSessionStorage(this.page);
  }
  onChangePage(event:number){
    this.page = event
    this.addResultToSessionStorage(event)
  }

  addResultToSessionStorage(event:number){
    if(sessionStorage.getItem(`results${event}`)){
    this.results=JSON.parse(sessionStorage.getItem(`results${event}`))
    this.loadingComplete = true;
    }else{
    this.loadingComplete = false;
    this.getRecentTransactions(event);
    }
  }

  getRecentTransactionsCount(){
    this.transactionDataService.getTransactionsCount().subscribe((count)=>{
      if(!!count.TotalTransactionCount)
    this.totalRecords=count.TotalTransactionCount||0
    })
  }

  getRecentTransactions(event:number) {
    this.transactionDataService.getRecentTransactions(this.page,this.perPage, this.NoPage).subscribe((transactions) => {

      // this.loadingComplete = true;
      // console.log("Blockchain: ", transactions);
      if(!!transactions){
      transactions.forEach(element => {

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
            productName: element.ProductName
          }

          this.results1.push(txnItem);
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
            productName: element.ProductName
          }
          this.results1.push(txnItem);
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
          this.results1.push(txnItem);
          this.otherResultsAvailable = true;


        }
        else if (element.TxnType == "splitChild") {
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
            from:element.From,
            to:element.To,
            productName: element.ProductName,
            identifier: element.Identifier,
            fromIdentifier1:element.FromIdentifier1,
            fromIdentifier2:element.FromIdentifier2,
            toIdentifier:element.ToIdentifier
          }
          this.results1.push(txnItem);
          this.otherResultsAvailable = true;
        }
        else if (element.TxnType == "splitParent") {
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
            productName: element.ProductName,
            identifier: element.Identifier,
            fromIdentifier1:element.FromIdentifier1,
            fromIdentifier2:element.FromIdentifier2,
            toIdentifier:element.ToIdentifier
          }
          this.results1.push(txnItem);
          this.otherResultsAvailable = true;
        }
        else if (element.TxnType == "merge") {
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
            productName: element.ProductName,
            identifier: element.Identifier,
            fromIdentifier1:element.FromIdentifier1,
            fromIdentifier2:element.FromIdentifier2,
            toIdentifier:element.ToIdentifier
          }
          this.results1.push(txnItem);
          this.otherResultsAvailable = true;
        }
        else if (element.TxnType == "stage transfer") {
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
            productName: element.ProductName
          }
          this.results1.push(txnItem);
          this.otherResultsAvailable = true;
        }
      });
      this.results=this.results1
      sessionStorage.setItem(`results${event}`,JSON.stringify(this.results))
      }else{
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
          errorTitle: "Somthing Went Wrong",
          errorMessage: "Unable to reach Tillit explorer gateway",
          errorMessageSecondary: "Please try again later",
          errorType: "empty"
        }
      }
    });
  }
}
