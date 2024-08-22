import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { RegisterComponent } from '../authentication/register/register.component';
import { CommonModule, UpperCasePipe } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { ConfirmationComponent } from '../dialogs/confirmation/confirmation.component';
import { RoleComponent } from '../dialogs/role/role.component';
import { ChangePasswordComponent } from '../dialogs/change-password/change-password.component';
import { ToastrService } from 'ngx-toastr';
import { User } from '../interfaces/user';
import Swiper from 'swiper';
import 'swiper/swiper-bundle.css';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, UpperCasePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  isAdmin!: boolean;
  currentLoggedIn: any;
  newPassword: any;
  
  users:User[]=[]
  admins:User[]=[]

  constructor(private service: AuthenticationService, private dialog: MatDialog, private toastr:ToastrService) {}

  ngOnInit() {
    this.isAdmin = this.service.isAdmin();
    console.log(this.isAdmin);

    this.currentLoggedIn = this.service.getData();
    console.log("Current loggedin admin", this.currentLoggedIn);
    
    this.service.getUsers().subscribe({
      next: (data) => {
        this.users = data.filter(user => user.role === 'User');
        this.admins = data.filter(user => user.role === 'Admin');
        console.log(this.users)
        console.log(this.admins)
      },
      error: (err) => {
        console.error("Failed to fetch users", err);
      }
    });

    const swiper = new Swiper('.swiper-container', {
      slidesPerView: 'auto',
      spaceBetween: 10,
      freeMode: true,
    });
  

  }


  create() {
    const dialogRef=this.dialog.open(RegisterComponent, {
       disableClose: true,
     });
     dialogRef.afterClosed().subscribe(res=>{
      console.log(res, "ressss")
      if(res.role.toLowerCase() === 'user'){
       this.users.push(res)
      }else{
       this.admins.push(res)   
       }
       this.refreshUsers();
     })
   }

   private refreshUsers(): void {
    this.service.getUsers().subscribe({
      next: (data) => {
        this.users = data.filter(user => user.role === 'User');
        this.admins = data.filter(user => user.role === 'Admin');
      },
      error: (err) => {
        console.error('Failed to fetch users', err);
      }
    });
  }

  deleteUser(userId: number): void {
    this.service.deleteUser(userId).subscribe({
      next: () => {
        // Remove user from local arrays
        this.users = this.users.filter(user => user.id !== userId);
        this.admins = this.admins.filter(admin => admin.id !== userId);
      },
      error: (err) => {
        console.error('Failed to delete user', err);
      }
    });
  }

  delete(id: number) {

    if (id === Number(this.currentLoggedIn?.nameid)) {
      this.toastr.warning("You cannot delete the currently logged-in admin.", '', {
        timeOut: 800
      });
      return;
    }
    
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '300px',
      height: '300px'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {  
        console.log(result, "result ")
        console.log(id)

        this.service.deleteUser(id).subscribe({
          next: () => {
            // Remove user from its array
            this.users = this.users.filter(user => user.id !== id);
            this.admins = this.admins.filter(admin => admin.id !== id);
            this.toastr.success("Deletion done!", '',{
              timeOut:800
            })

            if(id === Number(this.currentLoggedIn?.nameid) )
              this.logout()
          },
          error: (err) => {
            console.error('Failed to delete user', err);
          }
        });
      }}
    )
  }

  
  logout() {
    this.service.logout();
  }



  updateRole(id: number, newRole: string) {
    //  the loggedin admin cant change its role 
    if (Number(this.currentLoggedIn.nameid) !== id) {

    const userOrAdmin= this.users.find(user=> user.id ===id) || this.admins.find(admin=> admin.id=== id)
    if(!userOrAdmin){
      console.log("not found an user or admin")
      return;
    }
    if(userOrAdmin.role.toLowerCase() === newRole.toLowerCase()){
      this.toastr.info('This is the current role!', '', {
        timeOut: 800, 
      });
      return;
    }

      this.service.changeRole(id, newRole).subscribe({
        next:()=>{
          if(newRole.toLowerCase() === 'user'){
            const adminIndex = this.admins.findIndex(admin => admin.id === id);
          if (adminIndex !== -1) {
            const [admin] = this.admins.splice(adminIndex, 1);
            admin.role = 'user';
            this.users.push(admin);
          }
        } else if (newRole.toLowerCase() === 'admin') {

          const userIndex = this.users.findIndex(user => user.id === id);
          if (userIndex !== -1) {
            const [user] = this.users.splice(userIndex, 1);
            user.role = 'admin';
            this.admins.push(user);
          }
        }
        this.toastr.success('Role changed', '', {
          timeOut: 800, 
        });
      },
      error: (err) => {
        console.error('Failed to update user role', err);
        this.toastr.error('Failed to update the role', '', {
          timeOut: 800, 
        });
      }
    });
    } else {
      this.toastr.error('You cannot change your own role!', '', {
        timeOut: 800, 
      });
    }
  }
  

  changePassword(id: number, pass: string) {
    this.service.changePassword(id, pass).subscribe(response => {
      this.toastr.success('Password changed!');
      console.log(response);
    });
  }

  showRoleDialog(userId: number, currentRole: string): void {
    const dialogRef = this.dialog.open(RoleComponent, {
      width: '300px',
      height: '300px',
      data: { currentRole }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateRole(userId, result);
      }
    });
  }

  showPasswordDialog(userId: number): void {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '300px',
      height: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.changePassword(userId, result);
      }
    });
  }

}


