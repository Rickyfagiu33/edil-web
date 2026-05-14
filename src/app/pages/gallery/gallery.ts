import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, GalleryProject } from '../../services/data';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css']
})
export class GalleryComponent implements OnInit {
  activeFilter = 'all';
  allProjects: GalleryProject[] = [];
  filteredProjects: GalleryProject[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.gallery$.subscribe(projects => {
      this.allProjects = projects;
      this.applyFilter();
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.activeFilter === 'all') {
      this.filteredProjects = this.allProjects;
    } else {
      this.filteredProjects = this.allProjects.filter(p => p.category === this.activeFilter);
    }
  }
}
