import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuoteCalculatorService, QuoteResult } from '../../services/quote-calculator';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyPipe, TitleCasePipe],
  templateUrl: './quote.html',
  styleUrls: ['./quote.css']
})
export class QuoteComponent implements OnInit {
  quoteForm!: FormGroup;
  result: QuoteResult | null = null;
  hasData = false;

  constructor(private fb: FormBuilder, private calculator: QuoteCalculatorService) {}

  ngOnInit(): void {
    this.quoteForm = this.fb.group({
      workType: ['', Validators.required],
      sqMeters: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
      difficulty: ['', Validators.required]
    });

    this.quoteForm.valueChanges.subscribe(() => this.calculate());
  }

  calculate(): void {
    if (this.quoteForm.invalid) {
      this.hasData = false;
      return;
    }
    const { workType, sqMeters, difficulty } = this.quoteForm.value;
    this.result = this.calculator.calculate(workType, sqMeters, difficulty);
    this.hasData = true;
  }
}
