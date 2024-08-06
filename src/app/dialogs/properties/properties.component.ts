import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.css'
})
export class PropertiesComponent {

name!:string
type!:string
size:any
date!:Date
version:any

folderName!:string

  constructor(public dialogRef:MatDialogRef<PropertiesComponent>, @Inject(MAT_DIALOG_DATA)
  public data: any
   

)
{
  this.name = data.name;
  this.type = data.type;
  this.size = data.size 
  this.date = data.date;
  this.version= data.version


  }

  isFile(){
    return this.data.type==='file'
  }

  onCancel(){
    this.dialogRef.close()
  }

}
