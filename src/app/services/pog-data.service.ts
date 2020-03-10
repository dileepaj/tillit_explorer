import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HashData } from '../shared/models/hash-data.model';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PogDataService {

  constructor(private http: HttpClient) { }
  
  getPogProofData(id: string): Observable<any> {
    return this.http.get(environment.blockchain.getPogData + id).pipe(
      // tap(data => { console.log("Hash Data: ", JSON.stringify(data))}),
      catchError(this.handleError)
    );
  }

  handleError(err: HttpErrorResponse) {
    console.log("Error Handler: ", err);
    return throwError('test');
  }
}
