import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionDataService } from '../../services/transaction-data.service';
import { IBase64 } from '../../shared/models/base64.model';
import { ErrorMessage } from '../../shared/models/error-message.model';
import { encode, decode } from 'js-base64';
import {Location} from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.css']
})
export class TransactionDetailsComponent implements OnInit {
  title = 'angularowlslider';
  customOptions: any = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: true
  }
  txnId: string;
  txnItem: any;
  enableSlider: boolean = false;
  tdpImages = [];
  errorOccurred: boolean = false;
  loadingComplete: boolean = false;
  error: ErrorMessage;
  color = "primary";
  mode = "indeterminate";
  value = 20;

  constructor(private route: ActivatedRoute, private transactionDataService: TransactionDataService, private router: Router, private _location: Location) { }

  ngOnInit() {
    this.txnId = this.route.snapshot.paramMap.get('txnId');
    this.addTransactionDetailsToSessionStorage(this.txnId)
  }

  addTransactionDetailsToSessionStorage(txnId:string){
    if(sessionStorage.getItem(`${txnId}`)){
    this.txnItem=JSON.parse(sessionStorage.getItem(`${txnId}`))
    this.loadingComplete = true;  
    }else{
    this.loadingComplete = false;
    this.getTransactionDetails(txnId)
    }
  }

  goBack():void{
    this._location.back();
    }

  getTransactionDetails(txnId: string): void {
    this.transactionDataService.getTransactions(txnId,1,10).subscribe((transaction) => {
  //    console.log("Transaction: ", transaction);
      if (transaction[0].TxnType == "tdp") {
        this.transactionDataService.getTracifiedDataPackets(transaction[0].TdpId).subscribe((base64Data: IBase64) => {
        //  console.log("Backend: ", base64Data);
          this.loadingComplete = true;
          let tdp: any = JSON.parse(decode(base64Data.data));
         // console.log("Transaction Item: ", tdp);

         // console.log("Available Proofs: ", transaction[0].Blockchain);

          // let index = transaction[0].AvailableProof.findIndex((proof) => {
          //   console.log("Proof Loop: ", proof);
          //   return proof == "poc";
          // });

          // if (index != -1) {
          //   transaction[0].AvailableProof.splice(index, 1);
          // }

          // console.log("Proof After Removed: ", transaction[0].AvailableProof);

          this.txnItem = {
            status: transaction[0].Status,
            txnHash: transaction[0].Txnhash,
            transferType: transaction[0].TxnType,
            sequence: transaction[0].SequenceNo,
            txnUrl: transaction[0].Url,
            labTxnUrl: transaction[0].LabUrl,
            publickKey: transaction[0].SourceAccount,
            identifier: transaction[0].Identifier,
            tdpId: transaction[0].TdpId,
            timestamp: transaction[0].Timestamp,
            ledger: transaction[0].Ledger,
            fee: transaction[0].FeePaid,
            availableProofs: transaction[0].AvailableProof,
            productId: tdp.header.item.itemID,
            productName: tdp.header.item.itemName,
            stageId: tdp.header.stageID,
            blockchain:transaction[0].Blockchain,
            images: []
          }

          if (tdp.data) {
         //   check image exist in object
         for (let [key, value] of Object.entries(tdp.data)) {     
            if(Array.isArray(value)&&value.length>0)
              value.map((imageData)=>{
                if(!!imageData.image&&imageData.image!=''){
                  this.txnItem.images.push(imageData);
                  this.enableSlider = true;
                }
             })
            }   
          }
          if(!!this.txnItem){
            sessionStorage.setItem(`${txnId}`,JSON.stringify(this.txnItem))
          }
        }, (err) => {
        //  console.log("Get TDP Error: ", err);
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
      } else if (transaction[0].TxnType == "genesis") {

        let index = transaction[0].AvailableProof.findIndex((proof) => {
          console.log("Proof Loop: ", proof);
          return proof == "poc";
        });

        if (index != -1) {
          transaction[0].AvailableProof.splice(index, 1);
        }

        this.loadingComplete = true;

        this.txnItem = {
          status: transaction[0].Status,
          txnHash: transaction[0].Txnhash,
          transferType: transaction[0].TxnType,
          sequence: transaction[0].SequenceNo,
          txnUrl: transaction[0].Url,
          labTxnUrl: transaction[0].LabUrl,
          publicKey: transaction[0].SourceAccount,
          identifier: transaction[0].Identifier,
          timestamp: transaction[0].Timestamp,
          ledger: transaction[0].Ledger,
          fee: transaction[0].FeePaid,
          availableProofs: transaction[0].AvailableProof,
          blockchain:transaction[0].Blockchain,
          productName: transaction[0].ProductName,
          fromIdentifier1:transaction[0].FromIdentifier1,
          fromIdentifier2:transaction[0].FromIdentifier2,
        }

      } else if (transaction[0].TxnType == "coc") {

        let index = transaction[0].AvailableProof.findIndex((proof) => {
          console.log("Proof Loop: ", proof);
          return proof == "poc";
        });

        if (index != -1) {
          transaction[0].AvailableProof.splice(index, 1);
        }

        this.loadingComplete = true;

        this.txnItem = {
          status: transaction[0].Status,
          txnHash: transaction[0].Txnhash,
          transferType: transaction[0].TxnType,
          sequence: transaction[0].SequenceNo,
          txnUrl: transaction[0].Url,
          labTxnUrl: transaction[0].LabUrl,
          sender: transaction[0].From,
          receiver: transaction[0].To,
          identifier: transaction[0].Identifier,
          timestamp: transaction[0].Timestamp,
          ledger: transaction[0].Ledger,
          fee: transaction[0].FeePaid,
          availableProofs: transaction[0].AvailableProof,
          assetCode: "Not Sending",
          quantity: 0,
          inputData: transaction[0].inputData,
          blockchain:transaction[0].Blockchain,
          senderSigned: false,
          receiverSigned: false,
          fromIdentifier1:transaction[0].FromIdentifier1,
          fromIdentifier2:transaction[0].FromIdentifier2,
        }

      } else if (transaction[0].TxnType == "splitParent") {

        // let index = transaction[0].AvailableProof.findIndex((proof) => {
        //   console.log("Proof Loop: ", proof);
        //   return proof == "poc";
        // });

        // if (index != -1) {
        //   transaction[0].AvailableProof.splice(index, 1);
        // }

        this.loadingComplete = true;

        this.txnItem = {
          status: transaction[0].Status,
          txnHash: transaction[0].Txnhash,
          transferType: transaction[0].TxnType,
          sequence: transaction[0].SequenceNo,
          txnUrl: transaction[0].Url,
          labTxnUrl: transaction[0].LabUrl,
          publicKey: transaction[0].SourceAccount,
          identifier: transaction[0].Identifier,
          timestamp: transaction[0].Timestamp,
          ledger: transaction[0].Ledger,
          fee: transaction[0].FeePaid,
          availableProofs: transaction[0].AvailableProof,
          blockchain:transaction[0].Blockchain,
          productName: transaction[0].ProductName,
          fromIdentifier1:transaction[0].FromIdentifier1,
          fromIdentifier2:transaction[0].FromIdentifier2,
        }
      } else if (transaction[0].TxnType == "splitChild") {

        // let index = transaction[0].AvailableProof.findIndex((proof) => {
        //   console.log("Proof Loop: ", proof);
        //   return proof == "poc";
        // });

        // if (index != -1) {
        //   transaction[0].AvailableProof.splice(index, 1);
        // }

        this.loadingComplete = true;

        this.txnItem = {
          status: transaction[0].Status,
          txnHash: transaction[0].Txnhash,
          transferType: transaction[0].TxnType,
          sequence: transaction[0].SequenceNo,
          txnUrl: transaction[0].Url,
          labTxnUrl: transaction[0].LabUrl,
          publicKey: transaction[0].SourceAccount,
          identifier: transaction[0].Identifier,
          timestamp: transaction[0].Timestamp,
          ledger: transaction[0].Ledger,
          fee: transaction[0].FeePaid,
          availableProofs: transaction[0].AvailableProof,
          blockchain:transaction[0].Blockchain,
          productName: transaction[0].ProductName,
          fromIdentifier1:transaction[0].FromIdentifier1,
          fromIdentifier2:transaction[0].FromIdentifier2,
        }

      } else if (transaction[0].TxnType == "merge") {

        // let index = transaction[0].AvailableProof.findIndex((proof) => {
        //   console.log("Proof Loop: ", proof);
        //   return proof == "poc";
        // });

        // if (index != -1) {
        //   transaction[0].AvailableProof.splice(index, 1);
        // }

        this.loadingComplete = true;

        this.txnItem = {
          status: transaction[0].Status,
          txnHash: transaction[0].Txnhash,
          transferType: "Merge",
          sequence: transaction[0].SequenceNo,
          txnUrl: transaction[0].Url,
          publicKey: transaction[0].SourceAccount,
          identifier: transaction[0].Identifier,
          timestamp: transaction[0].Timestamp,
          ledger: transaction[0].Ledger,
          fee: transaction[0].FeePaid,
          availableProofs: transaction[0].AvailableProof,
          blockchain:transaction[0].Blockchain,
          productName: transaction[0].ProductName,
          fromIdentifier1:transaction[0].FromIdentifier1,
          fromIdentifier2:transaction[0].FromIdentifier2,
        }
      }
      if(!!this.txnItem){
        sessionStorage.setItem(`${txnId}`,JSON.stringify(this.txnItem))
      }
    }, (err) => {
    //  console.log("Get Transaction Error: ", err);
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

  navigateToProof(proof) {
    if (proof == "pog") {
      this.router.navigate(['/pog', this.txnItem.txnHash]);
    } else if (proof == "poe") {
      this.router.navigate(['/poe', this.txnItem.tdpId]);
    } else if (proof == "pococ") {
      this.router.navigate(['/pococ', this.txnItem.txnHash]);
    } else if (proof == "poc") {
      this.router.navigate(['/poc', this.txnItem.txnHash]);
    }
  }

  proofbotLink(txnHash,proof){
    let botUrl= environment.blockchain.getProofbotDomain+`?type=`+proof+`&txn=`+txnHash
    return botUrl
  }

}

