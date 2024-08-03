import { Component } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, MatButtonModule, FormsModule, ReactiveFormsModule, CommonModule, ToastrModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm!:FormGroup

  constructor(private dialog:MatDialog, private dialogRef:MatDialogRef<RegisterComponent>, 
    private fb:FormBuilder, private toastr:ToastrService
  ){}

  ngOnInit(){
    this.registerForm= new FormGroup({
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.*\s).{8,}$/)
      ])
    })
  }

  openLoginModal(){
    this.dialogRef.close()
    this.dialog.open(LoginComponent,{
      disableClose:true
    })
  }

onCancel(){
  this.dialogRef.close()
}

onSubmit(){
  //POST METHOD HERE 
  console.log(this.registerForm.value)

   this.toastr.success("Registration is done successfully")
      this.registerForm.reset()
      this.dialogRef.close();
      this.openLoginModal()
}









}

