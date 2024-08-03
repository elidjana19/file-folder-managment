import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../authentication/login/login.component';
import { RegisterComponent } from '../authentication/register/register.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatDialogModule, LoginComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private dialog:MatDialog){}

  openLoginModal(){
    this.dialog.open(LoginComponent,{
      disableClose:true,
      width:'400px'
    })
  }
  openRegisterModal(){
    this.dialog.open(RegisterComponent,{
      disableClose:true,
      width:'400px'
    })
  }

}
