import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../../shared/material/material-module';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-page-container',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule],
  templateUrl: './page-container.html',
  styleUrl: './page-container.scss',
})
export class PageContainerComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() breadcrumbs?: BreadcrumbItem[];
  @Input() maxWidth: 'default' | 'wide' | 'narrow' | 'fluid' = 'default';
  @Input() noPadding = false;
}
