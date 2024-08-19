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
import { AuthenticationService } from '../../authentication.service';
import { MatOption } from '@angular/material/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, MatButtonModule, FormsModule, ReactiveFormsModule, CommonModule, ToastrModule, MatOption, MatFormFieldModule, MatSelectModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm!:FormGroup
  isAdmin!:boolean

  constructor(private dialog:MatDialog, private dialogRef:MatDialogRef<RegisterComponent>, 
    private fb:FormBuilder, private toastr:ToastrService, 
    private service:AuthenticationService
  ){}

  ngOnInit(){
    this.registerForm= new FormGroup({
      role: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.*\s).{8,}$/)
      ])
    })

    this.isAdmin= this.service.isAdmin()
  }

  openLoginModal(){
    this.dialogRef.close()
    this.dialog.open(LoginComponent,{
      disableClose:true
    })
  }

onCancel(){
  this.dialogRef.close(false)
}

onSubmit(){
  //POST METHOD HERE 
  console.log(this.registerForm.value)

  if (this.registerForm.valid && this.isAdmin) {
    const user = this.registerForm.value;
    this.service.createUser(user).subscribe({
      next: response => {
        this.toastr.success(response.message, '', {
          timeOut: 800, 
        });
        this.registerForm.reset()
        this.dialogRef.close(user);

      },
      error: err => {
        console.log(err, "errorrrrrrrr")
        this.toastr.error(err.message, '', {
          timeOut: 800, 
        });
      }
    });
}
else{
  this.dialogRef.close();
}



}
}

