import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Proofs } from '../shared/models/proof.model';
import { HashData } from '../shared/models/hash-data.model';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { tap, catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PoeDataService {

  private header = {
    headers: {
      // tslint:disable-next-line:max-line-length
      Authorization: environment.backend.backendAuth,
    }
  };

  constructor(private http: HttpClient) { }

  getHashValues(id: string, sequenceNo: string): Observable<HashData> {
    let params = new HttpParams();
    params = params.append('tdpId', String(id) );
    params = params.append('seqNo', String(sequenceNo));
    console.log(environment.blockchain.getHashData, {params});
    return this.http.get<HashData>(environment.blockchain.getHashData, {params}).pipe(
      // tap(data => { console.log("Hash Data: ", JSON.stringify(data))}),
      catchError(this.handleError)
    );
  }

  getTransactionData(id: string): Observable<any> {
    return this.http.get(environment.backend.api_backendRaw + id, this.header).pipe(
      // tap(data => { console.log("Transaction Data: ", JSON.stringify(data))}),
      catchError(this.handleError)
    );
  }

  handleError(err: HttpErrorResponse) {
    console.log("Error Handler: ", err);
    return throwError('test');
  }
}
