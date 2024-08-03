import { Component, ElementRef } from '@angular/core';
import { FileTreeComponent } from '../file-tree/file-tree.component';
import { CommonModule } from '@angular/common';
import { FolderServiceService } from '../../folder-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FileTreeComponent, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  rootFolders: any[] = [];

  constructor(
    private folderService: FolderServiceService,
    public elRef: ElementRef
  ) {}

  ngOnInit(): void {
    // immediate changes of root folders in sidebar
    this.folderService.folderChanges$.subscribe(() => {
      this.getRootFolders();
    });

     this.getRootFolders();
  }

  getRootFolders() {
    this.folderService.getRootFolders().subscribe({
      next: (folders) => {
        this.rootFolders = folders;
      },
      error: (error) => {
        console.error('Error fetching root folders:', error);
      },
    });
  }

  // Handling Data: The next callback handles successful data retrieval by updating the rootFolders property. This allows the component to use this data in its view.

  // Error Handling: The error callback manages any errors that occur during the data fetching process, allowing for logging or displaying error messages to the user.
}
