import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';


export const routes: Routes = [
    {path:'', component:HomeComponent},
    {path:'myFiles', component:FileManagerComponent,canActivate: [AuthGuard] },
    {path:'dashboard', component:DashboardComponent,canActivate: [AuthGuard] },
    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: '**', redirectTo: '' } ,
];
