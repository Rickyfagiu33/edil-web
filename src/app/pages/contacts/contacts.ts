import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, SiteContent } from '../../services/data';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './contacts.html',
  styleUrls: ['./contacts.css']
})
export class ContactsComponent implements OnInit {
  content$!: Observable<SiteContent>;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.content$ = this.dataService.content$;
  }
}
