import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Proofs } from '../../../shared/models/proof.model';
import { HashData } from '../../../shared/models/hash-data.model';
import { TransactionData } from '../../../shared/models/transaction-data.model';
import { PoeDataService } from '../../../services/poe-data.service';
import { ErrorMessage } from '../../../shared/models/error-message.model';
import { ClipboardService } from 'ngx-clipboard';
import { trigger, transition, style, animate } from '@angular/animations';
import { encode, decode } from 'js-base64';
import {Location} from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './proof-poe.component.html',
  styleUrls: ['./proof-poe.component.css'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ opacity: 0 }),
            animate('0.5s ease-out',
              style({ opacity: 1 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ opacity: 1 }),
            animate('0.5s ease-in',
              style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})

export class ProofPoeComponent implements OnInit {

  loadingComplete: boolean = false;
  errorOccurred: boolean = false;
  textCopied = false;
  tracifiedCoreData;
  tracifiedCoreB64Data;
  transactionData;
  tdpId: string;
  hashesMatch: boolean = false;
  error: ErrorMessage;
  color = "primary";
  mode = "indeterminate";
  value = 20;
  public isCollapsed = true;
  poacstatus: any;
  proofbotDomain = environment.blockchain.proofBot
  botHash:string
  sequence:string

  constructor(private route: ActivatedRoute, private router: Router, private poeDataService: PoeDataService, private clipboardService: ClipboardService, private _location: Location) { }

  ngOnInit() {
    this.botHash= history.state.botHash
    this.tdpId = this.route.snapshot.paramMap.get('txnhash');
    this.sequence = this.route.snapshot.paramMap.get('sequence');
    this.getProofData(this.tdpId, this.sequence);
  }
 
  goBack():void{
  this._location.back();
  }

  isObject(val: any): boolean { 
    return typeof val === 'object'; 
  }

  CapitalFirstLetterAndPutSpace(text:string):string{
    text = text.replace(/(_|-)/g, ' ')
    .trim()
    .replace(/\w\S*/g, function(str) {
      return str.charAt(0).toUpperCase() + str.substr(1)
    })   
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')  
    return text
  }

  getProofData(tdpId: string, sequence:string): void {
    this.poeDataService.getHashValues(tdpId, sequence).subscribe((data) => {
      this.transactionData = data[0];
     // console.log("PoE Hash Data: ", this.transactionData);
    if(data[0].Status=="POE failed but POAC is present"){
      this.poacstatus="POAC is PRESENT"
    }
      if (this.transactionData.TxnType != "tdp") {
        this.errorOccurred = true;
        this.error = {
          errorTitle: "Invalid Proof Type",
          errorMessage: "Proof type is not associated with the current ID. Check if the entered ID is correct and try again.",
          errorMessageSecondary: "If you still don't see the results you were expecting, please let us know.",
          errorType: "empty"
        }
        return;
      }

      if (this.transactionData.DbHash.toUpperCase() === this.transactionData.BcHash.toUpperCase()) {
        this.hashesMatch = true;
      }

    //  console.log("Hashes: ", this.hashesMatch);
      this.poeDataService.getTransactionData(tdpId).subscribe((data) => {
     //   console.log("Base64: ", data);
        this.tracifiedCoreB64Data = data.data;
        this.tracifiedCoreData = JSON.parse(decode(this.tracifiedCoreB64Data));

        // if (Object.keys(this.tracifiedCoreData).length == 0) {
        //   this.errorOccurred = true;
        //   this.error.errorMessage = "There is no data associated with the given ID. Check if the entered ID is correct and try again.";
        //   this.error.errorMessageSecondary = "If you still don't see the results you were expecting, please let us know.";
        //   this.error.errorTitle = "No matching results found";
        //   this.error.errorType = "empty";
        // }
        this.loadingComplete = true;
      //console.log(`object`,this.tracifiedCoreData)
      //  console.log("Backend Data: ", this.tracifiedCoreData);
      }, (err) => {
       // console.log("Error Transaction Data: ", err);
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
    }, (err) => {
    //  console.log("Error Hash Value: ", err);
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

  isContainImage(array){
   let imagesArray=[]
    if(Array.isArray(array)&&array.length>0){
      array.map((imageData)=>{
        if(!!imageData.image&&imageData.image!=''){
          imagesArray.push(imageData.image)
        }
      })
      if(imagesArray.length>0)
        return true
      else
       return false   
    }else{
      return false
    }

  }

  copyB64Clipboard() {
    this.textCopied = true;
    let interval = setInterval(() => {
      this.textCopied = false;
      clearInterval(interval);
    }, 1500);

    this.clipboardService.copyFromContent(this.tracifiedCoreB64Data);
  }

}
