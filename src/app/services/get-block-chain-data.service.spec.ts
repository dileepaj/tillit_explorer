import { TestBed } from '@angular/core/testing';

import { GetBlockChainDataService } from './get-block-chain-data.service';

describe('GetBlockChainDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GetBlockChainDataService = TestBed.get(GetBlockChainDataService);
    expect(service).toBeTruthy();
  });
});
