import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [MatInputModule, MatCardModule, MatButtonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  @Input()
  currentPage!: number;
  @Input() totalPages!: number;



  constructor(private route: ActivatedRoute, private router: Router) {

  }

  previousPage() {
    if (this.currentPage > 1) {
      this.router.navigate(['/artworks',this.currentPage - 1]);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.router.navigate(['/artworks', this.currentPage + 1]);
    }
  }

  onChange(event: Event) {
    const numValue = (event.target as HTMLInputElement).value;
    console.log(numValue)

    if (!isNaN(Number(numValue))) {
      const num = +numValue; 
      if (num >= 1 && num <= this.totalPages) {
        this.router.navigate(['/artworks',num]);
      }
    }
  }
}
