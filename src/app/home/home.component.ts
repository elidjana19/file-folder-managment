import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../authentication/login/login.component';
import { RegisterComponent } from '../authentication/register/register.component';
import { Router, RouterModule, Routes } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { ToastrService } from 'ngx-toastr';
import { FirstAdminComponent } from '../authentication/first-admin/first-admin.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatDialogModule, LoginComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  isFirstUser=false

  constructor(private dialog:MatDialog, private router: Router, private service:AuthenticationService, private toastr:ToastrService){}

  ngOnInit(){
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

  open(){
    if(this.isFirstUser){
      this.dialog.open(FirstAdminComponent)
    } else{
      this.dialog.open(LoginComponent,{
        width:'300px'
      })
    }
  
  }






}
