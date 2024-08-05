import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FolderServiceService } from '../../folder-service.service';
import { ToastrService } from 'ngx-toastr';
import { ClickTrackerServiceService } from '../../click-tracker-service.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {

  selectedFile!: File

  constructor(private dialogRef:MatDialogRef<UploadComponent>, private folderService:FolderServiceService,
    @Inject(MAT_DIALOG_DATA) public data: { folderId: number }, private toastr:ToastrService, public clickTrackerService:ClickTrackerServiceService
  ){}


  @HostListener('click')
  onClick() {
    this.clickTrackerService.setInside(true);
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0]; // Get the first selected file
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onUpload(): void {
    if (this.selectedFile) { // Check if a file is selected
      this.folderService.uploadFile(this.data.folderId, this.selectedFile).subscribe(
        response => {
          console.log('Upload successful:', response);
          this.toastr.success('File uploaded successfully');
          this.dialogRef.close(true); 
        },
        error => {
          console.error('Upload error:', error);
          this.toastr.error('Failed to upload file');
        }
      );
    } else {
      this.toastr.warning('Please select a file to upload');
    }
  }
}