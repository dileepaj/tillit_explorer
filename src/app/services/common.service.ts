import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  decodeFromBase64(base64Text) {
    const decodedData = atob(base64Text);
    const decoder = new TextDecoder('utf-8');
    const decodedText = decoder.decode(new Uint8Array([...decodedData].map(char => char.charCodeAt(0))));
    return decodedText;
  }
}
