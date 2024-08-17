import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpperCasePipe } from '@angular/common';
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

  constructor(public dialogRef: MatDialogRef<LogoutConfirmComponent>, @Inject(MAT_DIALOG_DATA)
  public data: {
    name: string;
    role:string
  }) {
this.name=data.name
this.role=data.role
console.log(this.name)
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
