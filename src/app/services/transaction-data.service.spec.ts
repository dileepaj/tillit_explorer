import { TestBed } from '@angular/core/testing';

import { TransactionDataService } from './transaction-data.service';

describe('TransactionDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TransactionDataService = TestBed.get(TransactionDataService);
    expect(service).toBeTruthy();
  });
});
