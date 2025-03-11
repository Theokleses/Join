import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { linkGuard } from './link.guard';

describe('linkGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => linkGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
