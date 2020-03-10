import { TestBed } from '@angular/core/testing';

import { PococDataService } from './pococ-data.service';

describe('PococDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PococDataService = TestBed.get(PococDataService);
    expect(service).toBeTruthy();
  });
});
