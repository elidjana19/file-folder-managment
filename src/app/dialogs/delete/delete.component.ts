import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FolderServiceService } from '../../folder-service.service';
import { ClickTrackerServiceService } from '../../click-tracker-service.service';
@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [MatFormFieldModule,MatInputModule,MatButtonModule, FormsModule ],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.css'
})
export class DeleteComponent {

  constructor(private dialogRef:MatDialogRef<DeleteComponent>, 
    public clickTrackerService:ClickTrackerServiceService

  ){}
   
  @HostListener('click')
  onClick() {
    this.clickTrackerService.setInside(true);
  }
  
  onCancel(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this.dialogRef.close(true);
  }



}
