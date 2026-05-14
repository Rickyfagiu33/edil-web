import { Injectable } from '@angular/core';
import { DataService, QuoteSettings } from './data';

export interface QuoteResult {
  workTypeLabel: string;
  sqMeters: number;
  basePricePerSqm: number;
  multiplierLabel: string;
  subtotal: number;
  vat: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class QuoteCalculatorService {
  private settings: QuoteSettings;

  constructor(private dataService: DataService) {
    this.settings = this.dataService.getDefaultSettings(); // crea un metodo getDefaultSettings che restituisce i default hardcoded per inizializzazione veloce
    this.dataService.settings$.subscribe(s => this.settings = s);
  }

  calculate(workType: string, sqMeters: number, difficulty: string): QuoteResult {
    const basePricePerSqm = this.settings.basePrices[workType as keyof typeof this.settings.basePrices];
    const multiplier = this.settings.multipliers[difficulty as keyof typeof this.settings.multipliers];
    const subtotal = sqMeters * basePricePerSqm * multiplier;
    const vat = subtotal * this.settings.vatRate;
    const total = subtotal + vat;

    const workTypeLabels: Record<string, string> = {
      costruzione: 'Costruzione', restauro: 'Restauro', modifica: 'Modifica'
    };
    const multiplierLabels: Record<string, string> = {
      bassa: `Bassa (×${multiplier})`, media: `Media (×${multiplier})`, alta: `Alta (×${multiplier})`
    };

    return {
      workTypeLabel: workTypeLabels[workType],
      sqMeters,
      basePricePerSqm,
      multiplierLabel: multiplierLabels[difficulty],
      subtotal,
      vat,
      total
    };
  }
}
