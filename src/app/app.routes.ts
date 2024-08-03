import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FileManagerComponent } from './file-manager/file-manager.component';

export const routes: Routes = [
    {path:'', component:HomeComponent},
    {path:'myFiles', component:FileManagerComponent},
    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: '**', redirectTo: '' } ,
];
