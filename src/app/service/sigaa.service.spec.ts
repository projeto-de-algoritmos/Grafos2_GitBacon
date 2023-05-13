import { TestBed } from '@angular/core/testing';

import { SigaaService } from './sigaa.service';

describe('SigaaService', () => {
  let service: SigaaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SigaaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
