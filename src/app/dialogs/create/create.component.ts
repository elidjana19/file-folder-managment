import { Component, Inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-create',
  standalone: true,
  imports: [MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,FormsModule, ToastrModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent {

  folderName!:string

  constructor(private dialogRef:MatDialogRef<CreateComponent>, private toastr:ToastrService) {}

  onCancel(){
    this.dialogRef.close()
  }

  onSave(){
    if(!this.folderName){
      this.toastr.error("Please put a folder name")
    }
     else this.dialogRef.close(this.folderName)
    }
  

}
