import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../../shared/material/material-module';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  public currentYear = new Date().getFullYear();

  public popularCategories = [
    { name: 'Excavators', query: 'Excavators' },
    { name: 'Backhoe Loaders', query: 'Backhoe Loaders' },
    { name: 'Cranes & Lifters', query: 'Cranes' },
    { name: 'Diesel Generators', query: 'Generators' },
    { name: 'Forklifts & Reach Trucks', query: 'Forklifts' },
    { name: 'Compactors & Rollers', query: 'Compactors' },
  ];

  public topLocations = [
    'Bhopal, MP',
    'Indore, MP',
    'Jabalpur, MP',
    'Gwalior, MP',
    'Delhi NCR',
    'Pune, MH',
  ];
}
