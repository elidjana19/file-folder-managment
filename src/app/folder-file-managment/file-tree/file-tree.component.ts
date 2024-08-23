import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Renderer2, ElementRef, OnInit } from '@angular/core';
import { FolderServiceService } from '../../folder-service.service';
import { Subscription } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-file-tree',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './file-tree.component.html',
  styleUrl: './file-tree.component.css'
})
export class FileTreeComponent {

  constructor(private folderService:FolderServiceService, public elRef: ElementRef){
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkIfMobile());
  }
  @Input() folders: any[] = []; 
  @Input() parentId: string = '';

  selectedFolder: any = null;
  childFolders: any[] = [];
  currentPath: any;

  folderStates: { [key: string]: boolean } = {};

  isMobileView: boolean = false;
  isFileTreeVisible: boolean = true;
  display:boolean=false


  ngOnInit(): void {
    // Subscribe to folder changes
    this.folderService.getSelectedFolder().subscribe((folder) => {
      this.selectedFolder = folder;
      console.log(this.selectedFolder);
    });


    this.folderService.folderChanges$.subscribe(() => {
      if (this.selectedFolder) {
        this.folderService.getFolderById(this.selectedFolder.id).subscribe(folder => {
           this.updateFolderContent()
        });
       
      }
    });

    //select the first root folder automatically and show in file-explorer its content 
    // if (this.folders.length > 0) {
    //   this.onFolderClick(this.folders[0]);
    // }


  }

  // on click i open only one root folder
  onFolderClick(folder: any): void {
    if(this.isMobileView){
      this.isFileTreeVisible=false
    }
    if (this.selectedFolder?.id !== folder.id) {
      this.folderService.getFolderById(folder.id).subscribe(folder => {
        this.selectedFolder = folder;  // Set the entire folder object
        this.childFolders = folder.childFolders || [];
        this.folderService.setSelectedFolder(folder);
        this.findParent(this.selectedFolder)
        this.folderStates[folder.id] = true;

        this.folderService.buildPathFromFolder(folder)
      }, error => {
        console.error('Error fetching folder details:', error);
      });
    } 

    //dont close the seleted folder from sidebar
    else { 
      this.folderStates[folder.id] = !this.folderStates[folder.id];
      this.folderService.clearPath()   //for the root folder 
      this.selectedFolder = null;
      this.childFolders = [];
     this.folderService.setSelectedFolder(this.parentFolder)  //on collapse show the parent folder
      console.log("HEREEEE")
      this.folderService.buildPathFromFolder(this.parentFolder)
    } 
  }

  // Find parent folder
  parentFolder:any

  findParent(folder: any): void {
    if (!folder.parentFolderId) {
      console.log('No parent folder found.');
      return;
    }
    this.folderService.getFolderById(folder.parentFolderId).subscribe(parentFolder => {
      this.parentFolder = parentFolder;
      console.log('Parent Folder:', this.parentFolder);
    }, error => {
      console.error('Error fetching parent folder details:', error);
    });
  }


  updateFolderContent(): void {
    if (this.selectedFolder) {
      this.folderService
        .getFolderById(this.selectedFolder.id)
        .subscribe((folder) => {
          this.selectedFolder = folder;
        });
    }
  }

  checkIfMobile() {
    this.isMobileView = window.innerWidth < 768; // Adjust breakpoint as needed
  }

  isFolderActive(folder: any) {
    //console.log(this.selectedFolder)
      return this.selectedFolder && this.selectedFolder.id === folder.id;
  }

  isFolderOpen(folder: any): boolean {
    return !!this.folderStates[folder.id];
  }

  toggleFileTree() {
    this.isFileTreeVisible = !this.isFileTreeVisible;
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768; 
    this.isFileTreeVisible = !this.isMobileView;  
  }
  closeFileTree() {
    this.isFileTreeVisible = false;
  }
  
  isZipFolder(folder: any): boolean {
    return folder.name.endsWith('.zip');
  }
  
  
}