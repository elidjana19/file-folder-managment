import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderServiceService } from '../../folder-service.service';
import { HttpClientModule } from '@angular/common/http';
import {
  catchError,
  combineLatest,
  debounceTime,
  map,
  of,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { ClickTrackerServiceService } from '../../click-tracker-service.service';
import { MoveComponent } from '../../dialogs/move/move.component';
import { MatDialog } from '@angular/material/dialog';
import { VersionComponent } from '../../dialogs/version/version.component';
import { PropertiesComponent } from '../../dialogs/properties/properties.component';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [CommonModule, HttpClientModule, DragDropModule, FormsModule],
  templateUrl: './file-explorer.component.html',
  styleUrl: './file-explorer.component.css',
})
export class FileExplorerComponent implements OnInit {
  selectedFile: any;
  selectedFolder: any;
  private folderChangesSub!: Subscription;
  private fileChangesSub!: Subscription;

  private isSelectingFolder: boolean = false; // Flag to control content display

  dragData: { item: any; type: string } | null = null;
  draggedItem: { id: any; type: string } | null = null;

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;
  searchQuery!: string;

 // selectedItem: { id: any; type: string } | null = null;
  selectedItems: { id: number; type: string }[] = [];
  files: any;
  path:any
  selectedItem:any



  private searchQuery$ = new Subject<string>()
  private subscription: any;
  allFiles: any;
  fileExplorerData: any;
  allFolders:any

  constructor(
    private folderService: FolderServiceService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private elRef: ElementRef,
    public clickTrackerService: ClickTrackerServiceService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.folderService.selectedFolder$.subscribe((folder) => {
      if (this.isSelectingFolder) {
        // only select folder, not update the file-explorer
        this.isSelectingFolder = false;
      } else {
        // Update content if folder is actually opened, when a folder is selected from file-tree
        this.selectedFolder = folder;
        this.updateFolderContent();
      }
    });

    this.folderService.selectedFile$.subscribe((file) => {
      this.selectedFile = file;
    });

    // to immediately display changes on files/folders to file-explorer
    this.folderChangesSub = this.folderService.folderChanges$.subscribe(() => {
      if (!this.isSelectingFolder) {
        this.updateFolderContent();
      }
    });

    this.fileChangesSub = this.folderService.fileChanges$.subscribe(() => {
      if (!this.isSelectingFolder) {
        this.updateFolderContent();
      }
    });

    // selected items
    this.folderService.selectedItems$.subscribe((items) => {
      this.selectedItems = items;
      console.log('Selected Items:', this.selectedItems);
    });

    this.folderService.selectedItem$.subscribe((item) => {
      this.selectedItem=item
      console.log(item, 'itemmmmmmm');
    });


       // folder navigation PATH
       this.folderService.currentPath$.subscribe((path) => {
        this.path = path;
        console.log(this.path);
      });

    //search: this way offers minimal http calls
    this.searchSubject
      .pipe(
        debounceTime(300),
        switchMap((searchQuery) => {
          if (searchQuery === '' && this.selectedFolder) {
            //  i display all the content when i delete the query
            return this.folderService
              .getFolderById(this.selectedFolder?.id)
              .pipe(
                map((folder) => ({
                  folders: folder.childFolders,
                  files: folder.files,
                }))
              );
          }
          return combineLatest([
            this.folderService
              .searchFolder(searchQuery, this.selectedFolder?.id)
              .pipe(catchError(() => of([]))), //if an error i retun empty array and not crash the search
            this.folderService
              .searchFile(searchQuery, this.selectedFolder?.id)
              .pipe(catchError(() => of([]))),
          ]).pipe(map(([folders, files]) => ({ folders, files })));
        })
      )
          .subscribe((results) => {
        console.log(results , "serach here ")
        // if (this.selectedFolder) {
        //   this.selectedFolder.childFolders = results.folders;
        //   this.selectedFolder.files = results.files;
        //   console.log(this.selectedFolder.files, 'hereee'); //file i searched is here
        //   this.cdr.detectChanges();
        // }
        this.displayResults(results);
      });

    // this.subscription = this.folderService.search$.pipe(
    //   debounceTime(300),
    //   switchMap((searchQuery) => {
    //     if (searchQuery === '') {
    //       // Fetch all content if query is empty
    //       return this.folderService.getFolderById(this.selectedFolder?.id).pipe(
    //         map((folder) => ({
    //           folders: folder.childFolders,
    //           files: folder.files,
    //         }))
    //       );
    //     }

    //     return combineLatest([
    //       this.folderService.searchFolder(this.selectedFolder?.id, searchQuery).pipe(
    //         catchError(() => of([])) // Return empty array on error
    //       ),
    //       this.folderService.searchFile(this.selectedFolder?.id, searchQuery).pipe(
    //         catchError(() => of([])) // Return empty array on error
    //       ),
    //     ]).pipe(map(([folders, files]) => ({ folders, files })));
    //   })
    // ).subscribe((results) => {
    //   if (this.selectedFolder) {
    //     this.selectedFolder.childFolders = results.folders;
    //     this.selectedFolder.files = results.files;
    //     console.log(this.selectedFolder.files, 'hereee');
    //     this.cdr.detectChanges();
    //   }
    // });

    }


    displayResults(results: { folders: any[]; files: any[] }) {
      this.fileExplorerData = results; 
    
      if (this.selectedFolder) {
        this.selectedFolder.childFolders = results.folders;
        this.selectedFolder.files = results.files;
      } else {
        this.allFolders = results.folders; 
        this.allFiles = results.files; 
      }
      this.cdr.detectChanges();
    }
    
  search(): void {
    this.searchSubject.next(this.searchQuery);
  }

  //i fetch the latest data for the currently selected folder
  updateFolderContent(): void {
    if (this.selectedFolder) {
      this.folderService
        .getFolderById(this.selectedFolder.id)
        .subscribe((folder) => {
          this.selectedFolder = folder;
          this.cdr.detectChanges();
        });
    }
  }

  clickFolder(folder: any) {
    // set the folder only as selected
    this.isSelectingFolder = true;
   this.folderService.getFolderById(folder.id).subscribe((folderData) => {
    this.folderService.setSelectedFolder(folderData);
    this.folderService.addSelectedItem(folderData);
   })
  }

  doubleClickFolder(folder: any) {
    this.selectedItem=null  //so when i open i folder, i dont go to parent if a click in blank page
    // open the folder content
    this.isSelectingFolder = false;
    this.folderService.getFolderById(folder.id).subscribe((folderData) => {
      this.selectedFolder = folderData;
      this.updateFolderContent();
      // build path also
      this.folderService.buildPathFromFolder(this.selectedFolder);
    });
  }

  getFile(file: any) {
    //set the file only as selected
    this.folderService.setSelectedFile(file);
     this.folderService.addSelectedItem(file);

    // this.folderService.getFileById(file.id).subscribe((blob) => {
    //   console.log('Blob:', blob);
    // });
    this.folderService.getFile(file.id).subscribe((blob) => {
      console.log('File:', blob);
    });
  }

  isImage(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif'].includes(extension || '');
  }

  // drag and drop
  onDragStart(event: DragEvent, id: string, type: string) {
    this.draggedItem = { id, type };
   // event.dataTransfer?.setData('text/plain', id);
  }

  onDragLeave(event: DragEvent) {
    const target = event.target as HTMLElement;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Allow drop
  }

  onDrop(event: DragEvent, targetId: any, targetType: string) {
    event.preventDefault();
    if (this.draggedItem) {
      if (this.draggedItem.type === 'file' && targetType === 'folder') {
        this.folderService
          .moveFile(this.draggedItem.id, targetId)
          .subscribe(() => {
            this.updateFolderContent();
            this.toastr.success('File move done');
          });
      } else if (
        this.draggedItem.type === 'folder' &&
        targetType === 'folder'
      ) {
        this.folderService
          .moveFolder(this.draggedItem.id, targetId)
          .subscribe(() => {
            this.updateFolderContent();
            this.toastr.success('Folder move done');
          });
      }
    }
    this.draggedItem = null;
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'docx':
        return 'fa fa-file-word';
      case 'pdf':
        return 'fa fa-file-pdf';
      case 'pptx':
        return 'fa fa-file-powerpoint';
      case 'png':
      case 'jpg':
      case 'jpeg':
        return 'fa fa-image';
      default:
        return 'fa fa-file';
    }
  }

  // Batch selection and deletion

  // i used Set to store the selected items: folder/ files
  handleClick(item: any, type: string, event: MouseEvent): void {
    if (event.ctrlKey) {
      // Ctrl + Click for batch selection
      this.toggleSelection({ id: item.id, type });
    } else {
      // Regular click for single selection
      if (type === 'folder') {
        this.clickFolder(item);
      } else if (type === 'file') {
        this.getFile(item);
      }
    }
  }

  toggleSelection(item: { id: number; type: string }): void {
    const currentSelection = [...this.selectedItems]; // Copy of the current selection
    const index = currentSelection.findIndex(
      (selectedItem) =>
        selectedItem.id === item.id && selectedItem.type === item.type
    );

    if (index > -1) {
      // Deselect item
      currentSelection.splice(index, 1);
    } else {
      // Select item
      currentSelection.push({ id: item.id, type: item.type });
    }

    this.folderService.updateSelection(currentSelection);
    console.log(currentSelection); // For debugging
  }

  // is OKK
  selectAll() {
    this.selectedItem = null; //diselect the selected item, so i can do select all immediately

    if (this.selectedFolder) {
      this.folderService.updateSelection([]);

      this.selectedFolder.childFolders.forEach((folder: any) => {
        this.selectedItems.push({ id: folder.id, type: 'folder' });
      });

      this.selectedFolder.files.forEach((file: any) => {
        this.selectedItems.push({ id: file.id, type: 'file' });
      });
      console.log('All items selected:', this.selectedItems);
      this.folderService.updateSelection(this.selectedItems);
    }
  }

  // isSelected(item: any, type: string) {
  //   //for selected Item
  //   if (this.selectedItem) {
  //     return this.selectedItem.id === item.id && this.selectedItem.type === type;
  //   }
  //   // for selectedItems
  //   const itemKey = { id: item.id, type };
  //   return this.selectedItems.some(selectedItem =>
  //     JSON.stringify(selectedItem) === JSON.stringify(itemKey)
  //   );
  // }

  // better than json.strigify

  isSelected(item: any, type: string): boolean {
    if (this.selectedItem) {
      return (
        this.selectedItem.id === item.id && this.selectedItem.type === type
      ); //if 'item' match the selectedItem
    }
    const itemKey = { id: item.id, type };
    return this.selectedItems.some(
      (
        selectedItem //if 'item' match any of selecetdItems
      ) => selectedItem.id === itemKey.id && selectedItem.type === itemKey.type
    );
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if the click target is inside the FileExplorerComponent or HeaderComponent and delete button in delete dialog
    if (
      !this.elRef.nativeElement.contains(target) &&
      !this.clickTrackerService.isInside() 
    ) {
      this.deselectItems();
      this.showContextMenu = false;
    }

    // Reset the click state
    this.clickTrackerService.setInside(false);
  }

  deselect() {
    console.log('Clearing all selections');
  }

  parentf: any;

  deselectItems() {
    if (this.selectedItem) {
      this.handleSingleItem(this.selectedItem);
    } else if (this.selectedItems.length > 0) {
      if (this.selectedItems.every((item) => item.type === 'file')) {
        this.handleSelectedFiles(this.selectedItems);
        console.log('Deselect operation completed');
      } else {
        this.handleMultipleItems(this.selectedItems);
      }
    }
  }

  handleSingleItem(item: any) {
    if (item.type === 'folder') {
      this.folderService.getFolderById(item.id).subscribe(
        (folder) => {
          if (folder.parentFolderId) {
            this.folderService.getFolderById(folder.parentFolderId).subscribe(
              (parent) => {
                console.log('Parent folder:', parent);
                this.folderService.setSelectedFolder(parent);
              },
              (error) => console.error('Error fetching parent folder:', error)
            );
          } else {
            console.log('Selected folder has no parent.');
          }
        },
        (error) => console.error('Error fetching folder:', error)
      );
    } else if (item.type === 'file') {
      this.folderService.getFile(item.id).subscribe(
        (file) => {
          if (file.folderId) {
            this.folderService.getFolderById(file.folderId).subscribe(
              (folder) => {
                this.folderService.setSelectedFolder(folder);
              },
              (error) =>
                console.error('Error fetching folder by file ID:', error)
            );
          }
        },
        (error) => console.error('Error fetching file:', error)
      );
    }

    // Clear the selected item after processing
    this.selectedItem = null;
   //this.folderService.addSelectedItem(null)
  }

  handleSelectedFiles(files: any[]) {
    if (files.length === 0) {
      console.log('No items selected.');
      return;
    }

    const firstFile = files[0];

    this.folderService.getFile(firstFile.id).subscribe((file) => {
      console.log(file, 'file');
      this.folderService.getFolderById(file.folderId).subscribe(
        (folder) => {
          this.folderService.setSelectedFolder(folder);
          console.log(folder);
        },
        (error) => console.error('Error fetching folder:', error)
      );
    });

    this.selectedItems = [];
  }

  handleMultipleItems(items: any[]) {
    const foldersWithParents = items.filter((item) => item.type === 'folder');
    if (foldersWithParents.length > 0) {
      const firstFolder = foldersWithParents[0];

      this.folderService.getFolderById(firstFolder.id).subscribe(
        (folder) => {
          if (folder.parentFolderId) {
            this.folderService
              .getFolderById(folder.parentFolderId)
              .subscribe((parent) => {
                this.folderService.setSelectedFolder(parent);
                console.log('Parent folder of selected items:', parent);
                this.folderService.setSelectedFolder(parent);
              });
          }
        },
        (error) => console.error('Error fetching first folder:', error)
      );
    }
    // this.folderService.updateSelection(items);
    this.folderService.updateSelection([]);
    this.selectedItems = [];
  }

  // Right click

  contextMenuPosition = { x: 0, y: 0 };
  showContextMenu = false;
  contextMenuItems: string[] = [];
  item: any;

  onRightClick(event: MouseEvent, item: any, type: string) {
    event.preventDefault(); // Prevent the default context menu
    if (type === 'file') {
      // Show context menu options specific to files
      this.contextMenuItems = ['Change Version', 'Move', 'Properties'];
    } else {
      // Show context menu options for folders
      this.contextMenuItems = ['Move', 'Properties'];
    }

    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.showContextMenu = true;
    this.item = item; //file / folder
    console.log(item, 'itemmm');
  }

  handleContextMenuAction(action: string): void {
    switch (action) {
      case 'Change Version':
        this.showVersion();
        break;
      case 'Move':
        this.openMoveDialog();
        break;
      case 'Properties':
        this.openProperties();
        break;
      default:
        console.log('Unknown action:', action);
    }
  }


  openMoveDialog() {
    if (this.selectedItem) {
      const dialogRef = this.dialog.open(MoveComponent, {
        disableClose: true,
        width: '400px',
        data: { item: this.selectedItem, type: this.selectedItem.type }
      });
      this.showContextMenu = false;
    }
  }

  // active files
  getActive(files: any) {
    return files.filter(
      (file: { isActive: boolean }) => file.isActive === true
    );
  }

  showVersion() {
    console.log('Show version for:', this.item);
    if (this.selectedFile) {
      console.log(this.selectedFile.version);
      this.dialog.open(VersionComponent, {
        disableClose: true,
        data: {
          id: this.selectedFile.id,
          version: this.selectedFile.version,
          path: this.selectedFile,
        },
      });
    } else {
      console.error('No file selected');
    }

    this.showContextMenu = false; // Hide context menu
  }

  openProperties() {
    console.log('properties');
    const item = this.selectedItem;
    console.log(item, 'item');

    let data: any = {};

    if (item?.type === 'folder') {
      this.folderService.getFolderById(item.id).subscribe((folder) => {
        console.log(folder);
        data = {
          name: folder.name,
          type: folder.type,
          date: folder.createdDate,
        };
        this.openDialog(data);
      });
    } else if (item?.type === 'file') {
      this.folderService.getFile(item.id).subscribe((file) => {
        data = {
          name: file.name,
          type: file.type,
          size: file.size,
          date: file.uploadDate,
          version: file.version,
        };
        console.log(data);

        this.openDialog(data);
      });
    } else {
      console.log('No file or folder selected');
      return;
    }
  }

  private openDialog(data: any) {
    this.dialog.open(PropertiesComponent, {
      disableClose: true,
      data: data,
    });
  }


  ///////////////////////////////////////////
  onPathClick(index: number): void {
    // array that contains from the start of path to the clicked folder
    const newPath = this.path.slice(0, index + 1);

    if (newPath.length > 0) {
      // Get the ID of the clicked folder
      const clickedFolder = newPath[newPath.length - 1];

      if (clickedFolder && clickedFolder.id) {
        this.folderService.getFolderById(clickedFolder.id).subscribe(
          (folder) => {
            console.log(folder);
            this.folderService.setSelectedFolder(folder);
            this.folderService.updatePath(newPath); // Update the path if needed
          },
          (error) => {
            console.error('Error getting folder:', error);
          }
        );
      } else {
        console.error('Clicked folder not defined');
      }
    } else {
      console.error(' path empty.');
    }
  }
}


