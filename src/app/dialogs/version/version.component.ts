import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FolderServiceService } from '../../folder-service.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-version',
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    MatSelectModule,
  ],
  templateUrl: './version.component.html',
  styleUrl: './version.component.css',
})
export class VersionComponent {
  constructor(
    public dialogRef: MatDialogRef<VersionComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { id: number; version: any; path: any },
    public folderService: FolderServiceService,
    public toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getVersions();
  }

  neww!: number;
  //selectedVersion:any
  versions: any[] = [];

  onCancel() {
    this.dialogRef.close();
  }

  onSave(selectedVersion: any): void {
    if (selectedVersion === this.data.version) {
      this.toastr.error('its the same version');
      return;
    }
    this.folderService.rollbackFile(this.data.id, selectedVersion).subscribe(
      (res) => {
        this.toastr.success('Rollback successful'); // Update message as needed
        this.onCancel(); // Close dialog after success
      },
      (error) => {
        this.toastr.error('Error during rollback');
      }
    );
  }

  getVersions(): void {
    this.folderService.getVersions(this.data.id, this.data.path).subscribe(
      (versions) => {
        this.versions = versions;
      },
      (error) => {
        console.error('errorrrr fetching versions', error);
      }
    );
  }
}
