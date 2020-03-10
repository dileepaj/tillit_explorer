import { TestBed } from '@angular/core/testing';

import { PogDataService } from './pog-data.service';

describe('PogDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PogDataService = TestBed.get(PogDataService);
    expect(service).toBeTruthy();
  });
});
