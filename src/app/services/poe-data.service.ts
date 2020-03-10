import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Proofs } from '../shared/models/proof.model';
import { HashData } from '../shared/models/hash-data.model';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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

  getHashValues(id: string): Observable<HashData> {
    return this.http.get<HashData>(environment.blockchain.getHashData + id).pipe(
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
