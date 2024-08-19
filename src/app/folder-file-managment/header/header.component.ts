import {
  Component,
  ElementRef,
  HostListener,
} from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CreateComponent } from '../../dialogs/create/create.component';
import { RenameComponent } from '../../dialogs/rename/rename.component';
import { DeleteComponent } from '../../dialogs/delete/delete.component';

import { FilePreviewComponent } from '../file-preview/file-preview.component';
import { UploadComponent } from '../../dialogs/upload/upload.component';
import { FolderServiceService } from '../../folder-service.service';
import { ToastrService } from 'ngx-toastr';
import { ClickTrackerServiceService } from '../../click-tracker-service.service';

import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../authentication.service';
import { LogoutConfirmComponent } from '../../dialogs/logout-confirm/logout-confirm.component';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatDialogModule, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  selectedFolder: any = null;
  selectedFile: any;
  folderStack: any[] = [];

  selectedItems: any;

  path: any[] = [];
  folderChangesSub: any;
  selectedItem: any;

  searchQuery: any;

  isAdmin!: boolean;

  logged: any;

  constructor(
    public dialog: MatDialog,
    private folderService: FolderServiceService,
    private toastr: ToastrService,
    public elRef: ElementRef,
    private clickTrackerService: ClickTrackerServiceService,
    private service: AuthenticationService
  ) {}

  ngOnInit() {
    this.folderService.getSelectedFolder().subscribe((folder) => {
      this.selectedFolder = folder;
      console.log(this.selectedFolder);
      //for buttons able disable status
      this.selectedFile = null;
    });

    this.folderService.getSelectedFile().subscribe((file) => {
      this.selectedFile = file;
      console.log(this.selectedFile);
      //for buttons able disable status
      this.selectedFolder = null;
    });

    // folder navigation PATH
    this.folderService.currentPath$.subscribe((path) => {
      this.path = path;
      console.log(this.path);
    });

    // for batch selection
    // selected items
    this.folderService.selectedItems$.subscribe((items) => {
      this.selectedItems = items;
      console.log('Selected Items:', this.selectedItems);
    });

    this.folderService.selectedItem$.subscribe((item) => {
      this.selectedItem = item;
      console.log('Selected Item:', this.selectedItem);
    });

    // this.isAdmin = this.service.isAdmin();
    // console.log(this.isAdmin)

    // the logged user
    this.logged = this.service.getData();
    console.log(this.logged, 'logged');
  }

  // create is OK
  openCreateFolderDialog() {
    const dialogRef = this.dialog.open(CreateComponent, {
      width: '400px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createFolder(result);
      } else {
        console.log('not createeeeeed');
      }
    });
  }

  @HostListener('click')
  onClick() {
    this.clickTrackerService.setInside(true);
  }

  createFolder(folderName: string) {
    const parentId = this.selectedFolder ? this.selectedFolder.id : null;
    console.log(parentId, 'parent iddddd');
    this.folderService.createFolder(folderName, parentId, 'folder').subscribe(
      (res) => {
        this.toastr.success('Folder created successfully');
      },
      (error) => {
        this.toastr.error(error.message);
      }
    );
  }

  openRenameFolderDialog() {
    const fileName = this.selectedFile?.name.replace(/\.[^.]+$/, '');
    const dialogRef = this.dialog.open(RenameComponent, {
      disableClose: true,
      width: '400px',
      data: {
        name: this.selectedFolder?.name || fileName,
        originalName: this.selectedFolder?.name || fileName,
        id: this.selectedFolder?.id || this.selectedFile?.id,
        type: this.selectedFolder?.type || this.selectedFile?.type,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result, 'resultt');
        if (this.selectedFolder) {
          // to show the new name in dialog
          this.folderService
            .getFolderById(this.selectedFolder.id)
            .subscribe((folder) => {
              this.selectedFolder = folder;
              // i need to build the new path if the folder is opened not just selected
              const foundPathItem = this.path.find(
                (item) => item.id === result.id
              );

              if (foundPathItem) {
                console.log('Found item:', foundPathItem);
                this.folderService
                  .getFolderById(foundPathItem.id)
                  .subscribe((item) => {
                    this.folderService.buildPathFromFolder(item);
                  });
              } else {
                console.log('Item not found');
              }
            });
        } else if (this.selectedFile) {
          this.folderService.getFile(this.selectedFile.id).subscribe((file) => {
            this.selectedFile = file;
          });
        }
      }
    });
  }

  // DELETE OK
  openDeleteFolderDialog(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (this.selectedFolder || this.selectedFile) {
      const dialogRef = this.dialog.open(DeleteComponent, {
        width: '400px',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.delete();
          console.log(result);
        }
      });
    } else {
      this.toastr.error('No folder or file selected');
    }
  }

  delete() {
    //after i delete the selected item/items i put the parentdfolder as selected
    const fileIds: number[] = [];
    const folderIds: number[] = [];

    let filesDeleted = false;
    let foldersDeleted = false;

    //  batch deletion
    if (this.selectedItems.length > 0) {
      this.selectedItems.forEach((item: { id: number; type: string }) => {
        if (item.type === 'file') {
          fileIds.push(item.id);
        } else if (item.type === 'folder' || item.type === 'zipfolder') {
          folderIds.push(item.id);
        }
      });

      if (fileIds.length > 0) {
        filesDeleted = true;
        this.folderService.deleteFiles(fileIds).subscribe(
          () => {
            if (filesDeleted && !foldersDeleted) {
              this.toastr.success('Files deleted successfully');
            }
          },
          (error) => {
            this.toastr.error('Failed to delete files');
            console.error('Error deleting files:', error);
          }
        );
      }

      if (folderIds.length > 0) {
        foldersDeleted = true;
        this.folderService.deleteFolders(folderIds).subscribe(
          () => {
            if (foldersDeleted && !filesDeleted) {
              this.toastr.success('Folders deleted successfully');
            }
          },
          (error) => {
            this.toastr.error('Failed to delete folders');
            console.error('Error deleting folders:', error);
          }
        );
      }
      if (foldersDeleted && filesDeleted) {
        this.toastr.success('Items deleted');
      }
      this.folderService.updateSelection([]);
    } else if (this.selectedFolder) {
      //  single folder deletion
      this.folderService.deleteFolder(this.selectedFolder.id).subscribe({
        next: () => {
          if (this.selectedFolder.parentFolderId) {
            this.folderService
              .getFolderById(this.selectedFolder.parentFolderId)
              .subscribe((parentFolder) => {
                this.folderService.setSelectedFolder(parentFolder);
                this.folderService.buildPathFromFolder(parentFolder);
                this.toastr.success('Folder deleted successfully');
              });
          } else {
            this.folderService.setSelectedFolder(null);
            this.folderService.clearPath();
          }
        },
        error: (error) => {
          this.toastr.error('Error deleting folder', error);
        },
      });
    } else if (this.selectedFile) {
      // single file deletion
      this.folderService.deleteFile(this.selectedFile.id).subscribe({
        next: () => {
          if (this.selectedFile.folderId) {
            this.folderService
              .getFolderById(this.selectedFile.folderId)
              .subscribe((folder) => {
                this.folderService.setSelectedFolder(folder);
              });
          }

          this.toastr.success('File deleted successfully');
        },
        error: (error) => {
          this.toastr.error('Error deleting file', error.message);
        },
      });
    }
  }

  openPreviewDialog() {
    if (this.selectedFile) {
      this.folderService.preview(this.selectedFile.id).subscribe((response) => {
        const base64Data = `data:${response.contentType};base64,${response.base64}`;
        console.log(base64Data);
        this.dialog.open(FilePreviewComponent, {
          data: {
            name: this.selectedFile.name,
            contentType: response.contentType,
            base64Data: base64Data,
          },
          disableClose: true,
        });
      });
    }
  }

  isDisabled() {
    return this.folderService.getStackLength() === 0;
  }

  openUploadDialog() {
    if (this.selectedFolder && this.selectedFolder.id) {
      const dialogRef = this.dialog.open(UploadComponent, {
        width: '400px',
        data: { folderId: this.selectedFolder.id },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log('File upload successful');
        }
      });
    }
  }

  // DOWNLOAD IS OKK

  downloadFile(file: any): void {
    this.folderService.downloadFile(file.id).subscribe(
      (blob) => {
        let fileType: string;

        if (file.name.endsWith('.docx')) {
          fileType =
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (file.name.endsWith('.pdf')) {
          fileType = 'application/pdf';
        } else if (file.name.endsWith('.pptx')) {
          fileType =
            'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        } else if (file.name.endsWith('.png')) {
          fileType = 'image/png';
        } else if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
          fileType = 'image/jpeg';
        } else if (file.name.endsWith('.txt')) {
          fileType = 'application/json';
        } else {
          this.toastr.error('Unsupported file type');
          return;
        }

        const url = window.URL.createObjectURL(
          new Blob([blob], { type: fileType })
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.name);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        this.toastr.success('Download done');
      },
      (error) => {
        this.toastr.error('Error downloading file');
      }
    );
  }

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

  disableOtherActions() {
    return this.selectedItems.length > 1;
  }

  isZip() {
    return this.selectedItem?.type === 'zipfolder';
  }

  // logout() {
  //   this.service.logout();
  //   console.log('here');
  //   this.folderService.setSelectedFile(null);
  //   this.folderService.setSelectedFolder(null);
  //   this.folderService.clearPath();
  // }

  openLogout() {
    const dialogRef = this.dialog.open(LogoutConfirmComponent, {
      disableClose: true,
      data: { name: this.logged.unique_name , role:this.logged.role},
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('User confirmed logout');
      } else {
        console.log('User canceled logout');
      }
    });
  }


}
