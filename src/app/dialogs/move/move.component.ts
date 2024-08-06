import { ChangeDetectorRef, Component, destroyPlatform, HostListener, Inject } from '@angular/core';
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
  imports: [CommonModule, MatButtonModule, MatInputModule, MatFormFieldModule, FormsModule, MatSelectModule],
  templateUrl: './move.component.html',
  styleUrl: './move.component.css'
})
export class MoveComponent {

  folders: any[] = [];
  selectedFolder:any
  selectedFile:any

  constructor(
    public dialogRef: MatDialogRef<MoveComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { itemId: string },
    private folderService: FolderServiceService, private toastr:ToastrService,
    private cdr: ChangeDetectorRef, 
    public clickTrackerService:ClickTrackerServiceService
  ) {}

  ngOnInit() {
    this.folderService.getAllFolders().subscribe(folders => this.folders = folders);

    this.folderService.getSelectedFolder().subscribe(folder => {
        this.selectedFolder = folder;
      });

      this.folderService.getSelectedFile().subscribe(file=>{
        this.selectedFile=file
      })
  }


  onMove(destinationId: number) {
    if(this.selectedFile){
      if(destinationId === this.selectedFile.folderId){
        console.log(this.selectedFile.folderId)
        this.toastr.error("Already here")
        this.dialogRef.close()
      }else{
    this.folderService.moveFile(this.selectedFile.id , destinationId).subscribe(res=>{
      //this.updateFolderContent()
    })
    console.log(destinationId)
    console.log(this.selectedFile)
    if (destinationId) {
      this.folderService.getFolderById(destinationId).subscribe(folder => {
        this.selectedFolder = folder;
      });
    }
    this.dialogRef.close()
    this.toastr.success("File Move done")
  }}
  else if (this.selectedFolder && !this.selectedFile){
    if(destinationId===this.selectedFolder.id ){
      this.toastr.error("It is the same folder ")
      this.dialogRef.close()
    }
    else if(destinationId === this.selectedFolder.parentFolderId){
      this.toastr.error("You are already here, please choose a new folder destination ")
      this.dialogRef.close()
    }else if(this.isRootFolder(this.selectedFolder)) {
      this.toastr.error("Cannot move a root folder ")
      this.dialogRef.close()
    }
    else{
    this.folderService.moveFolder(this.selectedFolder.id , destinationId).subscribe(res=>{
     // this.updateFolderContent()
    })
    console.log(destinationId)
    console.log(this.selectedFolder)
    if (destinationId) {
      this.folderService.getFolderById(destinationId).subscribe(folder => {
        this.selectedFolder = folder;
      });
    }
  
    this.dialogRef.close()
    this.toastr.success("Folder Move done")
  }
  } 
}


isRootFolder(folder: any): boolean {
  return folder.parentFolderId === null || folder.parentFolderId === undefined || folder.parentFolderId === 0
}


updateFolderContent(): void {
    if (this.selectedFolder) {
      // Fetch the Latest Folder Data of the selectedFolder=> "folder" :contains that data
      this.folderService
        .getFolderById(this.selectedFolder.id)
        .subscribe((folder) => {
          console.log(folder, 'FOLDERRRRR');
          this.selectedFolder = folder; //update the selectedFolder with the new data received from server
          this.cdr.detectChanges();
        });
    }
  }

  
  @HostListener('click')
  onClick() {
    this.clickTrackerService.setInside(true);
  }



}

