import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
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
import { AuthenticationService } from '../../authentication.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Folder } from '../../interfaces/folder';

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
  path: any;
  selectedItem: any;
  isMobile: boolean = false;

  allFiles: any;
  fileExplorerData: any;
  allFolders: any;
  logged: any;
  noresult:boolean=false

  touchStartTime: number | null = null;
  longPressDuration = 500;

  constructor(
    private folderService: FolderServiceService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private elRef: ElementRef,
    public clickTrackerService: ClickTrackerServiceService,
    public dialog: MatDialog,
    private service: AuthenticationService,
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver
   
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset])
    .subscribe(result => {
      this.isMobile = result.matches;
    });
  }

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
      this.selectedItem = item;
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
        console.log(results, 'search here ');
        this.displayResults(results);
      });
    this.logged = this.service.getData();
    console.log(this.logged, 'logged');
    }


  onFolderTouchStart(event: TouchEvent, folder: Folder) {
    this.touchStartTime = new Date().getTime();
  }

    onFolderTouchEnd(event: TouchEvent, folder: Folder) {
      console.log("start")
      if (this.touchStartTime) {
        const touchDuration = new Date().getTime() - this.touchStartTime;
        if (touchDuration >= this.longPressDuration) {
          // Long press detected - select the folder
          console.log("here")
        this.clickFolder(folder)
          
        } else {
          // Short press - open the folder
          this.doubleClickFolder(folder);
        }
        this.touchStartTime = null;
      }
    }

  displayResults(results: { folders: any[]; files: any[] }) {
    this.fileExplorerData = results;

    this.noresult = false;
   
    setTimeout(() => {
      if (this.searchQuery && results.folders.length === 0 && results.files.length === 0) {
        this.noresult = true;
      }
    }, 200); 
    if (this.selectedFolder) {
      this.selectedFolder.childFolders = results.folders;
      this.selectedFolder.files = results.files;
    } else {
      this.allFolders = results.folders;
      this.allFiles = results.files;
    }
    this.fileExplorerData = results;
  }

  search(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(){
    this.searchQuery=''
    this.allFiles=[]
    this.allFolders=[]
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

  isZipFolder(folder: any): boolean {
    return folder.name.endsWith('.zip');
  }
  
  onFolderClick(folder: Folder) {
    if (this.isMobile) {
      this.doubleClickFolder(folder);
    } else {
      this.clickFolder(folder);
    }
  }
  
  clickFolder(folder: any) {
   //select zip but not open
    this.isSelectingFolder = true;
    this.folderService.getFolderById(folder.id).subscribe((folderData) => {
      this.folderService.setSelectedFolder(folderData);
      this.folderService.addSelectedItem(folderData);
      console.log('folder');
    });
  }
  
  doubleClickFolder(folder: any) {
    if (this.isZipFolder(folder)) {
      return; // not open
    }
  
    this.isSelectingFolder = false;
    this.folderService.getFolderById(folder.id).subscribe((folderData) => {
      this.selectedFolder = folderData;
      this.updateFolderContent();
      this.folderService.buildPathFromFolder(this.selectedFolder);
    });
    this.searchQuery = '';
    this.allFolders = [];
    this.allFiles = [];
  }
  

  getFile(file: any) {
    //set the file only as selected
    this.folderService.setSelectedFile(file);
    this.folderService.addSelectedItem(file);
    console.log('filee');

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

  // Batch selection
  private lastSelectedItem: any = null;

  // i used Set to store the selected items: folder/ files
  handleClick(item: any, type: string, event: MouseEvent): void {
    if (event.ctrlKey) {
      // Ctrl + Click for batch selection
      this.toggleSelection({ id: item.id, type });
      this.lastSelectedItem = item;
    } else if (event.shiftKey) {
    } else {
      // Regular click for single selection
      if (type === 'folder' || type === 'zipfolder') {
        this.onFolderClick(item)
        //this.clickFolder(item);
      } else if (type === 'file') {
        this.getFile(item);
      }
    }
  }

  selectAll() {
    this.selectedItem = null; //diselect the selected item, so i can do select all immediately

    if (this.selectedFolder) {
      this.folderService.updateSelection([]);

      this.selectedFolder.childFolders.forEach((folder: any) => {
        this.selectedItems.push({ id: folder.id, type: folder.type });
      });

      this.selectedFolder.files.forEach((file: any) => {
        this.selectedItems.push({ id: file.id, type: file.type });
      });
      console.log('All items selected:', this.selectedItems);
      this.folderService.updateSelection(this.selectedItems);
    }
    console.log("all")
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
  // selectAll() {
  //   this.selectedItem=null //diselect the selected item, so i can do select all immediately

  //   if (this.selectedFolder) {
  //     this.folderService.updateSelection([]);

  //     this.selectedFolder.childFolders.forEach((folder: any) => {
  //       this.selectedItems.push({ id: folder.id, type: 'folder' });
  //     });

  //     this.selectedFolder.files.forEach((file: any) => {
  //       this.selectedItems.push({ id: file.id, type: 'file' });
  //     });
  //     console.log('All items selected:', this.selectedItems);
  //     this.folderService.updateSelection(this.selectedItems);
  //   }
  // }

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
    const bigContainer = this.elRef.nativeElement.querySelector('.bigContainer');

    // Check if the click target is inside the FileExplorerComponent or HeaderCompon and delete button in delete dialog
    if (
     !bigContainer.contains(target) &&
     //!this.elRef.nativeElement.contains(target) &&
      !this.clickTrackerService.isInside()
    ) {
      this.deselectItems();
      this.showContextMenu = false;
      this.clearSearch()
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
        console.log("here")
      }
    }
    this.folderService.buildPathFromFolder(this.selectedItem);
  }

  handleSingleItem(item: any) {
    if (item.type === 'folder' && this.isSelectingFolder) {
      this.folderService.getFolderById(item.id).subscribe(
        (folder) => {
          if (folder.parentFolderId) {
            this.folderService.getFolderById(folder.parentFolderId).subscribe(
              (parent) => {
                console.log('Parent folder:', parent);
                console.log('here');
                this.folderService.setSelectedFolder(parent);
                this.folderService.buildPathFromFolder(parent)
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
                console.log(folder , "folllllllll")
                this.folderService.setSelectedFolder(folder);
                this.folderService.buildPathFromFolder(folder)
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
    this.folderService.addSelectedItem(null);
    console.log(this.selectedFolder);
    this.folderService.setSelectedFolder(this.selectedFolder);
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
          console.log(folder, "folder of file ");
        },
        (error) => console.error('Error fetching folder:', error)
      );
    });
    this.selectedItems = [];
    this.folderService.updateSelection([])
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
    } else if (type === 'folder') {
      // Show context menu options for folders
      this.contextMenuItems = ['Move', 'Properties', 'Zip'];
    } else if (type === 'zipfolder') {
      this.contextMenuItems = ['Move', 'Unzip'];
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
      case 'Zip':
        this.zip(this.selectedItem.id);
        break;
      case 'Unzip':
        this.unzipFolder(this.selectedItem.id);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }

  getIconClass(action: string): string {
    switch (action) {
      case 'Change Version':
        return 'fa-solid fa-exchange-alt';
      case 'Move':
        return 'fa-solid fa-arrows-alt';
      case 'Properties':
        return 'fa-solid fa-info-circle';
      case 'Zip':
        return 'fa-solid fa-file-archive';
      case 'Unzip':
        return 'fa-solid fa-file-archive';
        case 'Download':
        return 'fa-solid fa-download';
      default:
        return '';
    }
  }

  openMoveDialog() {
    if (this.selectedItem) {
      const dialogRef = this.dialog.open(MoveComponent, {
        disableClose: true,
        width: '400px',
        data: { item: this.selectedItem, type: this.selectedItem.type },
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

  zip(folderId: number) {
    this.showContextMenu = false;
    this.folderService.zip(folderId).subscribe(
      (response) => {
        console.log(response, "responseee ");
        const url = window.URL.createObjectURL(
          new Blob([response], {type: "application/zip"})
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', "name");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        this.toastr.success('Download done');
      },
      (error) => {
        console.log(error);
      }
    );
  }

  unzipFolder(folderId: number): void {
    this.showContextMenu = false;
    this.folderService.unzip(folderId).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.error('Unzip failed', error);
      }
    );
  }

  hasZipExtension(name: string): boolean {
    return name.toLowerCase().endsWith('.zip');
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

  clicked = false;

  viewMode: 'grid' | 'list' = 'grid';
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
    this.clicked = true;
  }

  formatFileSize(size: bigint): string {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = 0;
    let sizeInNumber = Number(size); // Convert bigint to number

    while (sizeInNumber >= 1024 && i < units.length - 1) {
      sizeInNumber /= 1024;
      i++;
    }
    return `${sizeInNumber.toFixed(2)} ${units[i]}`;
  }

}
