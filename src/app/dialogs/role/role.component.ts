import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatOption } from '@angular/material/core';
import { MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
@Component({
  selector: 'app-role',
  standalone: true,
  imports: [MatOption, MatLabel, MatSelect, MatFormFieldModule, CommonModule, MatButton],
  templateUrl: './role.component.html',
  styleUrl: './role.component.css'
})
export class RoleComponent {
  selectedRole: string;
  roles=["Admin", "User"]

  constructor(
    public dialogRef: MatDialogRef<RoleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedRole = data.currentRole;
  }

  onSave(): void {
    this.dialogRef.close(this.selectedRole);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
