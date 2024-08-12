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
  
       this.getAllFolders()
    });


     this.getAllFolders()
  }


  getAllFolders() {
    this.folderService.getAllFolders().subscribe(folders => {
      console.log(folders, "all");
      this.rootFolders = this.buildHierarchy(folders)
  })
  }


  buildHierarchy(folders: any[]): any[] {
    const map = new Map<number, any>();
    const roots: any[] = [];

    folders.forEach(folder => {
      folder.childFolders = [];
      map.set(folder.id, folder);
    });

    folders.forEach(folder => {
      if (folder.parentFolderId === 0) {
        roots.push(folder); 
      } else {
        const parent = map.get(folder.parentFolderId); 
        if (parent) {
          parent.childFolders!.push(folder); //if folder has a parent folder, i add that folder to 'childFolders[]' of parent
        }
      }
    });
    return roots;
  }
}
  

