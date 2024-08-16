import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-logout-confirm',
  standalone: true,
  imports: [],
  templateUrl: './logout-confirm.component.html',
  styleUrl: './logout-confirm.component.css'
})
export class LogoutConfirmComponent {

  
  name!:string

  constructor(public dialogRef: MatDialogRef<LogoutConfirmComponent>, @Inject(MAT_DIALOG_DATA)
  public data: {
    name: string;
  }) {
this.name=data.name
console.log(this.name)
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
