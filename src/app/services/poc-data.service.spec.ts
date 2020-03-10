import { TestBed } from '@angular/core/testing';

import { PocDataService } from './poc-data.service';

describe('PocDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PocDataService = TestBed.get(PocDataService);
    expect(service).toBeTruthy();
  });
});
