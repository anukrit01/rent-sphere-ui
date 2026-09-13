import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/components/header/header';
import { Footer } from './core/components/footer/footer';
import { NotificationToastComponent } from './core/components/notification/notification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, NotificationToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  public title = signal('RentSphere');
}
