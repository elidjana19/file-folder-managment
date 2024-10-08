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
import { AuthenticationService } from '../../authentication.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, MatButtonModule, FormsModule, ReactiveFormsModule, ToastrModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm!:FormGroup
  createForm!:FormGroup
  users:any
  isFirstUser: boolean = false;

  constructor(private dialog:MatDialog, private dialogRef:MatDialogRef<LoginComponent>,
    private fb:FormBuilder, private router:Router, private toastr:ToastrService, 
    public service:AuthenticationService
  ){}

  ngOnInit(){
    this.loginForm= new FormGroup({
      username:new FormControl('', Validators.required),
      password:new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.*\s).{8,}$/) // Password pattern
      ])
    })

    this.createForm= new FormGroup({
      username:new FormControl('', Validators.required),
      password:new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.*\s).{8,}$/) // Password pattern
      ])
    })

    this.service.isFirstUser().subscribe(res=>{
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

  // onSubmit(): void {
  //   if (this.isFirstUser) {

  //          this.service.createFirstAdmin(this.createForm.value).subscribe({
  //       next: () => {
  //         this.toastr.success('Admin created successfully!', '', {
  //           timeOut: 900,
  //         });

          

  //         this.dialogRef.close(); // Close the dialog
  //       },
  //       error: (err:any) => {
  //         this.toastr.error('Failed to create admin!', '', {
  //           timeOut: 800,
  //         });
  //         console.error('Admin creation failed', err);
  //       }
  //     });
  //   }
  //  else {
  //     const { username, password } = this.loginForm.value;
  //     this.service.login(username, password).subscribe({
  //       next: (res) => {
  //         console.log(res, "res")
  //         this.toastr.success('Successful login', '', {
  //           timeOut: 800, 
  //         });
  //         const role = this.service.getRole();
  //         console.log(role, "roleeee")
  //         if (role === 'Admin') {
  //           this.router.navigate(['/dashboard']);
  //         } else {
  //           this.router.navigate(['/myFiles']); 
  //         }
  //         this.dialogRef.close()
  //       },
  //       error: err => {
  //         this.toastr.error('Username or password is incorrect!', '', {
  //           timeOut: 800, 
  //         });
  //         console.error('Login failed', err);
  //       }
  //     });  
  //   }
  //   this.isFirstUser= false;
  // }

  
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
            next: (res) => {
              this.router.navigate(['/dashboard']);
              this.toastr.success('Successful login', '', {
                timeOut: 800, 
              });

             
              // this.isFirstUser=false
              this.dialogRef.close(); 
            },
            error: err => {
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
    } else  {
      const { username, password } = this.loginForm.value;
      this.service.login(username, password).subscribe({
        next: (res) => {
          this.toastr.success('Successful login', '', {
            timeOut: 800, 
          });
  
          const role = this.service.getRole();
          if (role === 'Admin') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/myFiles']); 
          }
  
          this.dialogRef.close(); 
        },
        error: err => {
          this.toastr.error('Username or password is incorrect!', '', {
            timeOut: 800, 
          });
          console.error('Login failed', err);
        }
      });
    }
    
    this.isFirstUser = false;
  }
  
  

}
