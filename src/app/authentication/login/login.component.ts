import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RegisterComponent } from '../register/register.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ToastrModule } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, MatButtonModule, FormsModule, ReactiveFormsModule, ToastrModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm!:FormGroup

  constructor(private dialog:MatDialog, private dialogRef:MatDialogRef<LoginComponent>,
    private fb:FormBuilder, private router:Router, private toastr:ToastrService
  ){}

  ngOnInit(){
    this.loginForm= new FormGroup({
      username:new FormControl('', Validators.required),
      password:new FormControl('', Validators.required)
    })
  }

  openRegisterModal(){
    this.dialogRef.close()
    this.dialog.open(RegisterComponent,{
      disableClose:true
    })
  }


  onCancel(){
    this.dialogRef.close()
  }

  onSubmit(){
    // GET METHOD HERE
    if(this.loginForm.valid){
      const loginData= this.loginForm.value
      console.log(loginData)

      this.toastr.success('Successfull Login');
        this.loginForm.reset()
        this.dialogRef.close();  //i close the login modal
         this.router.navigate(['/myFiles']);
    }
  }

}
