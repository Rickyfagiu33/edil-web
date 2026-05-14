import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, SiteContent, ServiceItem } from '../../services/data';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  content$!: Observable<SiteContent>;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.content$ = this.dataService.content$;
  }
}
