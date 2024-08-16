import {
  ChangeDetectorRef,
  Component,
  destroyPlatform,
  HostListener,
  Inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FolderServiceService } from '../../folder-service.service';
import { MatSelectModule } from '@angular/material/select';
import { ClickTrackerServiceService } from '../../click-tracker-service.service';

@Component({
  selector: 'app-move',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatSelectModule,
  ],
  templateUrl: './move.component.html',
  styleUrl: './move.component.css',
})
export class MoveComponent {
  folders: any[] = [];
  type:any
  item:any

  constructor(
    public dialogRef: MatDialogRef<MoveComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: any, type:string },
    private folderService: FolderServiceService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    public clickTrackerService: ClickTrackerServiceService
  ) {
    // i get the item i have to move 
    this.item=data.item,
    this.type=data.type
  }

  ngOnInit() {
    this.folderService
      .getAllFolders()
      .subscribe((folders) => (this.folders = folders));
  }

  onMove(destinationId: number) {
     
    if (this.type === 'file') {
      console.log(destinationId, "dest")
      console.log(this.item, "file to move")
        this.folderService.moveFile(this.item.id, destinationId).subscribe(
          (res) => {
            this.cdr.detectChanges();
            this.toastr.success("File Move done");
            this.dialogRef.close();
          },
          (error) => {
            console.error("Error moving file:", error);
            this.toastr.error("Cannot move this way");
            this.dialogRef.close()
          }
        );
    } else if (this.type === 'folder' || this.type==='zipfolder') {
      console.log(destinationId, "dest")
      console.log(this.item, "folder to move")
      if (destinationId === this.item.id) {
        this.toastr.error("Cannot move a folder into itself.");
        this.dialogRef.close();
      }   else {
        this.folderService.moveFolder(this.item.id, destinationId).subscribe(
          (res) => {
            this.cdr.detectChanges();
            this.toastr.success("Folder Move done");
            this.dialogRef.close();
          },
          (error) => {
            console.error("Error moving folder:", error);
            this.toastr.error("Cannot move this way");
            this.dialogRef.close()
          }
        );
      }
    }
  }
  

  @HostListener('click')
  onClick() {
    this.clickTrackerService.setInside(true);
  }
}
