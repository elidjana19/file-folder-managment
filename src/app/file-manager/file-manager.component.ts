import { Component } from '@angular/core';
import { SidebarComponent } from '../folder-file-managment/sidebar/sidebar.component';
import { HeaderComponent } from '../folder-file-managment/header/header.component';
import { FileExplorerComponent } from '../folder-file-managment/file-explorer/file-explorer.component';

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, FileExplorerComponent],
  templateUrl: './file-manager.component.html',
  styleUrl: './file-manager.component.css'
})
export class FileManagerComponent {

}
