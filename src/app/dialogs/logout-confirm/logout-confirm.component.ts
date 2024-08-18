import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpperCasePipe } from '@angular/common';
import { AuthenticationService } from '../../authentication.service';
import { FolderServiceService } from '../../folder-service.service';
@Component({
  selector: 'app-logout-confirm',
  standalone: true,
  imports: [UpperCasePipe],
  templateUrl: './logout-confirm.component.html',
  styleUrl: './logout-confirm.component.css'
})
export class LogoutConfirmComponent {

  
  name!:string
  role!:string

  constructor(private service:AuthenticationService, private folderService:FolderServiceService, public dialogRef: MatDialogRef<LogoutConfirmComponent>, @Inject(MAT_DIALOG_DATA)
  public data: {
    name: string;
    role:string
  },
) {
this.name=data.name
this.role=data.role
  }

  onConfirm(): void {
    this.dialogRef.close(true)
      this.service.logout();
      console.log('here');
      this.folderService.setSelectedFile(null);
      this.folderService.setSelectedFolder(null);
      this.folderService.clearPath();
    }


  onCancel(): void {
    this.dialogRef.close(false);
    console.log("h")
  }
}
