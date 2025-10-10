import { Component } from '@angular/core';
import { MaterialModule } from "../../../shared/material/material-module";

@Component({
  selector: 'app-header',
  imports: [MaterialModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

}
