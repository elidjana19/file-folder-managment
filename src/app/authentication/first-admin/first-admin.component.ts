import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../authentication.service';
import { RegisterComponent } from '../register/register.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-first-admin',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, MatButtonModule, FormsModule, ReactiveFormsModule, ToastrModule, CommonModule],
  templateUrl: './first-admin.component.html',
  styleUrl: './first-admin.component.css'
})
export class FirstAdminComponent {


  createForm!:FormGroup
  users:any
  isFirstUser: boolean = false;

  constructor(private dialog:MatDialog, private dialogRef:MatDialogRef<FirstAdminComponent>,
    private fb:FormBuilder, private router:Router, private toastr:ToastrService, 
    public service:AuthenticationService
  ){}

  ngOnInit(){
  
    this.createForm= new FormGroup({
      username:new FormControl('', Validators.required),
      password:new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.*\s).{8,}$/) // Password pattern
      ])
    })

    this.service.isFirstUser().subscribe((res: boolean)=>{
      if(res){
        this.isFirstUser=res
        this.toastr.info("No users are registered. First admin is created...", '',{
          timeOut:900
        }
        )
      }
      console.log(res, "no one in database")
    })

  }

 

  onCancel(){
    this.dialogRef.close()
  }


  
  onSubmit(): void {
    if (this.isFirstUser) {
      const { username, password } = this.createForm.value;
      this.service.createFirstAdmin(username, password).subscribe({
        next: () => {
          this.toastr.success('Admin created successfully!', '', {
            timeOut: 900,
          })
          const { username, password } = this.createForm.value; // Extract credentials from the registration form
          this.service.login(username, password).subscribe({
            next: (res:any) => {
              this.router.navigate(['/dashboard']);
              this.toastr.success('Successful login', '', {
                timeOut: 800, 
              });

             
              // this.isFirstUser=false
              this.dialogRef.close(); 
            },
            error: (err:any) => {
              this.toastr.error('Login failed after admin creation!', '', {
                timeOut: 800, 
              });
              console.error('Login failed', err);
            }
          });
        },
        error: (err: any) => {
          this.toastr.error('Failed to create admin!', '', {
            timeOut: 800,
          });
          console.error('Admin creation failed', err);
        }
      });
    } 
  
  

}


}
