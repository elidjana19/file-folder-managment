import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatLabel } from '@angular/material/input';
import { MatFormField } from '@angular/material/input';
import { MatError } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, MatInput, MatButton, MatLabel, MatFormField,  MatError, CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  passwordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ChangePasswordComponent>
  ) {}

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      newPassword: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.*\s).{8,}$/)]
      ]
    });
  }

  onSave(): void {
    if (this.passwordForm.valid) {
      const newPassword = this.passwordForm.value.newPassword;
      this.dialogRef.close(newPassword);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
