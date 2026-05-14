import { TestBed } from '@angular/core/testing';

import { QuoteCalculatorService } from './quote-calculator';

describe('QuoteCalculator', () => {
  let service: QuoteCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuoteCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
