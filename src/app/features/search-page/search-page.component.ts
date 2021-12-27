import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransactionDataService } from 'src/app/services/transaction-data.service';
import { map } from 'rxjs/operators';
import { IBase64 } from '../../shared/models/base64.model';
import { ITransactionTDP } from '../../shared/models/transaction-tdp.model';
import { ITransactionCoc } from '../../shared/models/transaction-coc.model';
import { ITransactionGenesis } from 'src/app/shared/models/transaction-genesis.model';
import { ErrorMessage } from 'src/app/shared/models/error-message.model';
import { encode, decode } from 'js-base64';

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
  // Loader Variable
  color = "primary";
  mode = "indeterminate";
  value = 20;
  page:number = 1;
  perPage:number = 10;
  NoItems:number;
  constructor(private route: ActivatedRoute, private transactionDataService: TransactionDataService) { }
  ngOnInit() {
    this.route.params.subscribe((data) => {
      this.results = [];
      this.loadingComplete = false;
      this.searchId = data.id;
      this.search(this.searchId);
      if ( this.page != 1){
        this.reloadCurrentPage()
      }
    });
  }
  onChangePage(event:number){
    this.route.params.subscribe((data) => {
     this.page = event;
     this.results = [];
     this.loadingComplete = false;
     this.searchId = data.id;
     this.search(this.searchId);
     if (this.page == 1) {
      this.reloadCurrentPage()
    }
  });
  }
  reloadCurrentPage() {
    window.location.reload();
   }
  search(id: string): void {
    this.transactionDataService.getTransactions(id,this.page,this.perPage).subscribe((transactions) => {
   //   console.log("Transactions: ", transactions);
      this.errorOccurred = false;
      if(!!transactions){
      transactions.forEach(element => {
      // console.log("Blockchain: ", element);
        this.NoItems = element.Itemcount 
       
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
            publicKey: element.SourceAccount,
            identifier: element.Identifier,
            timestamp: element.Timestamp,
            ledger: element.Ledger,
            fee: element.FeePaid,
            availableProofs: element.AvailableProof,

            productId: element.ProductId,
            productName: element.ProductName,
            blockchainName: "Stellar"
          }

          this.results.push(txnItem);
          this.otherResultsAvailable = true;



        } else if (element.TxnType == "genesis") {

          let index = element.AvailableProof.findIndex((proof) => {
            return proof == "poc";
          });

          if (index != -1) {
            element.AvailableProof.splice(index, 1);
          }

          let txnItem  = {
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

            productId: element.ProductId,
            productName: element.ProductName,
            blockchainName: "Stellar"
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

          let txnItem = {
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

            assetCode: element.AssetCode,
            quantity: 0,
            productName: element.ProductName,
            inputData: element.inputData,
            blockchainName: "Stellar",
            cocStatus: element.cocStatus,
            senderSigned: false,
            receiverSigned: false
          }

          this.results.push(txnItem);
          this.otherResultsAvailable = true;
      //   console.log("ELSE: ", txnItem);
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
            blockchainName: "Stellar",
            productId: element.ProductId,
            productName: element.ProductName,
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
            blockchainName: "Stellar",
            productId: element.ProductId,
            productName: element.ProductName,
            identifier: "Not Available"
          }

          this.results.push(txnItem);
          this.otherResultsAvailable = true;
       //   console.log("ELSE: ", txnItem);
        }
      })}else{
        this.loadingComplete = true;
        this.errorOccurred = true;
        this.error = {
          errorTitle: "No matching results found",
          errorMessage: "We can not find the requested records in Stellar blockchain",
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
     console.log("Blockchain Erroraaaaaaaaaaaaaaaaa: ", err);
    console.log("err.error.code",err.error.code)
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
