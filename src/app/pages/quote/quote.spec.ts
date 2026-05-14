import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteComponent } from './quote';

describe('Quote', () => {
  let component: QuoteComponent;
  let fixture: ComponentFixture<QuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
