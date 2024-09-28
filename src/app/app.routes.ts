import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { UserGuard } from './user.guard';
import { AdminGuard } from './admin.guard';


export const routes: Routes = [
    {path:'', component:HomeComponent},
    {path:'myFiles', component:FileManagerComponent,canActivate: [UserGuard] },
    {path:'dashboard', component:DashboardComponent,canActivate: [AdminGuard] },
    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: '**', redirectTo: '' } ,
];
