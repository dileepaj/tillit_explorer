import { TestBed } from '@angular/core/testing';

import { PoeDataService } from './poe-data.service';

describe('PoeDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PoeDataService = TestBed.get(PoeDataService);
    expect(service).toBeTruthy();
  });
});
