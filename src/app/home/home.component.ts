import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../authentication/login/login.component';
import { RegisterComponent } from '../authentication/register/register.component';
import { Router, RouterModule, Routes } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatDialogModule, LoginComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private dialog:MatDialog, private router: Router){}

  openLoginModal(){
    this.dialog.open(LoginComponent,{
      width:'300px'
    })
  }



}
