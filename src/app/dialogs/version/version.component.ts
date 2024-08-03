import { Component } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-version',
  standalone: true,
  imports: [MatFormFieldModule],
  templateUrl: './version.component.html',
  styleUrl: './version.component.css'
})
export class VersionComponent {
  constructor(public dialogRef:MatDialogRef<VersionComponent>){}


  onCancel(){
    this.dialogRef.close()
  }
}
