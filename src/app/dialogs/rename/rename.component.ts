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
  imports: [MatFormFieldModule,MatInputModule,MatButtonModule, FormsModule, ToastrModule],
  templateUrl: './rename.component.html',
  styleUrl: './rename.component.css'
})
export class RenameComponent {

  //folderName!:string

  newName:any

  constructor(private dialogRef:MatDialogRef<RenameComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { folderName: string, originalName: string, id:number },
    private toastr:ToastrService, 
    private folderService:FolderServiceService, 
    public clickTrackerService:ClickTrackerServiceService
  ){}

  @HostListener('click')
  onClick() {
    this.clickTrackerService.setInside(true);
  }

  
  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSave() {
    if (!this.data.folderName) {
      this.toastr.error("Please enter a folder name.");
      return;
    } else if (this.data.folderName === this.data.originalName) {
      this.toastr.error("No changes made. Please enter a different folder name.");
      return;
    } else {
      this.folderService.renameFolder(this.data.id, this.data.folderName).subscribe(
         () => {
          this.toastr.success("Folder renamed successfully.");
          this.dialogRef.close(this.data.folderName);
        },
        error => {
          this.toastr.error("There is a problem with renaming that folder");
          console.error(error);
        }
      );
    }
  }
  


}

  







