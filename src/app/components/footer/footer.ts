import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, SiteContent } from '../../services/data';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent implements OnInit {
  content$!: Observable<SiteContent>;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.content$ = this.dataService.content$;
  }
}
