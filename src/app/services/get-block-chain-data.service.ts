import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IBase64 } from '../shared/models/base64.model';
import { environment } from '../../environments/environment';
import { encode, decode } from 'js-base64';

@Injectable({
  providedIn: 'root'
})
export class GetBlockChainDataService {
  private header = {
    headers: {
      // tslint:disable-next-line:max-line-length
      Authorization : environment.backend.backendAuth,
    }
  };
  private messageSource = new BehaviorSubject<string>('');
  currentMessage = this.messageSource.asObservable();

  dataset = [];
  TdPpId = '';
  JsonData = '';

  constructor(private http: HttpClient) { }

  getTdpId(id: string) {
    return this.http.get(environment.blockchain.getTransactionFromPublicKey + id);
  }

  getData(id: string) {
    // console.log('Break : ' + id);
    this.requestData(id);
  }
  // GAPDVULCREN7Y3OPVUKVMU4PXT22PLCJ2KGTGEOZASWSQAUBJXYV2WX5
  // This function sends the request to Gateway
  requestData(id: string) {
     // console.log('Break : ' + id);
     this.http.get(environment.blockchain.getTransactionFromPublicKey + id).subscribe(
       data => {
         if (data !== '') {
          this.TdPpId =  data[0].TdpId;
          // return this.TdPpId;
          // console.log('ppp: ' + this.TdPpId);
          this.sendToBackEnd(this.TdPpId);
         }
        }
       );
  }

// 5d9b036cfa82a20001ed7c2c
  public sendToBackEnd(id: string) {
    this.http.get<IBase64>(environment.backend.api_backendRaw + id, this.header).subscribe(data => {
      if (data.data !== '') {
        this.JsonData = JSON.parse(decode(data.data));
        // console.log(this.JsonData);
        this.messageSource.next(this.JsonData);
      }
    });
  }

  setData(data: any) {
    data.forEach(element => {
      this.dataset.push(element);
    });
  }
}
