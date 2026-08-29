import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../material/material-module';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule],
  templateUrl: './category-card.html',
  styleUrl: './category-card.scss',
})
export class CategoryCardComponent {
  @Input({ required: true }) category!: Category;
  @Input() compact = false;
}
