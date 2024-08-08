import { Component } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { FileManagerComponent } from './file-manager/file-manager.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'final';

 
}
