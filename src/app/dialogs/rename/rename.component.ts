import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { ToastrService } from 'ngx-toastr';
import { FolderServiceService } from '../../folder-service.service';
import { ClickTrackerServiceService } from '../../click-tracker-service.service';

@Component({
  selector: 'app-rename',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ToastrModule,
  ],
  templateUrl: './rename.component.html',
  styleUrl: './rename.component.css',
})
export class RenameComponent {
  //folderName!:string

  newName: any;
  originalName: string;
  type: 'file' | 'folder';
  id: number;

  constructor(
    private dialogRef: MatDialogRef<RenameComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      name: string;
      originalName: string;
      id: number;
      type: 'file' | 'folder';
    },
    private toastr: ToastrService,
    private folderService: FolderServiceService,
    public clickTrackerService: ClickTrackerServiceService
  ) {
    this.originalName = data.originalName;
    this.newName = data.name;
    this.id = data.id;
    this.type = data.type;
  }

  @HostListener('click')
  onClick() {
    this.clickTrackerService.setInside(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  //onSave() {
  // if (!this.data.folderName) {
  //   this.toastr.error("Please enter a folder name.");
  //   return;
  // } else if (this.data.folderName === this.data.originalName) {
  //   this.toastr.error("No changes made. Please enter a different folder name.");
  //   return;
  // } else {
  //   this.folderService.renameFolder(this.data.id, this.data.folderName).subscribe(
  //      () => {
  //       this.toastr.success("Folder renamed successfully.");
  //       this.dialogRef.close(this.data.folderName);
  //     },
  //     error => {
  //       this.toastr.error("There is a problem with renaming that folder");
  //       console.error(error);
  //     }
  //   );
  // }
  // this.dialogRef.close(this.newName)
  // }

  onSave() {
    if (this.newName.trim() === '') {
      this.toastr.error('Name cannot be empty');
    } else if (this.newName === this.originalName) {
      this.toastr.error('Not the same name');
    } else {
      if (this.type === 'folder') {
        this.folderService.renameFolder(this.id, this.newName).subscribe(
          () => {
            this.dialogRef.close({
              newName: this.newName,
              type: this.type,
              id: this.id,
            });
            this.toastr.success('Done');
          },
          (error) => console.log('Error renaming file')
        );
      } else {
        this.folderService.renameFile(this.id, this.newName).subscribe(
          () => {
            this.dialogRef.close({
              newName: this.newName,
              type: this.type,
              id: this.id,
            });
            this.toastr.success('Done');
          },
          (error) => console.log(this.originalName, 'org')
        );
      }
    }
  }
}
