import { TestBed } from '@angular/core/testing';

import { VerificationServiceService } from './verification-service.service';

describe('VerificationServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VerificationServiceService = TestBed.get(VerificationServiceService);
    expect(service).toBeTruthy();
  });
});
