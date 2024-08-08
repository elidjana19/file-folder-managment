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
      next: (folders) => {  //handle successful data
        this.rootFolders = folders;
      },
      error: (error) => {  //handle errors
        console.error('Error fetching root folders:', error);
      },
    });
  }
}
