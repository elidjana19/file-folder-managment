import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import {MAT_DIALOG_DATA,  MatDialogRef } from '@angular/material/dialog';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-file-preview',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './file-preview.component.html',
  styleUrl: './file-preview.component.css'
})
export class FilePreviewComponent {
  decodedText:any
  safePdfUrl!: SafeResourceUrl;
  pdfSrc:any


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef:MatDialogRef<FilePreviewComponent>, private sanitizer: DomSanitizer) { 
    this.decodeBase64(data);
    if (data.contentType === 'application/pdf') {
      this.createPdfUrl(data.base64Data);
    }
   
  }

  decodeBase64(data: any): void {
    if (data.contentType === 'text/plain') {
      const base64Data = data.base64Data.split(',')[1]; 
      this.decodedText = atob(base64Data);
    }
  }

  // topdf(){
  //   let base64= this.data.replace('data:application/pdf;base64, ', '')
  //   const byteArray = new Uint8Array(
  //     atob(base64).split('').map((char)=>char.charCodeAt(0))
     
  //   )
  //   console.log(byteArray, "BYTEEEEEEEE")

  //   const file= new Blob([byteArray], {type:'application/pdf'})
  //   this.pdfSrc= URL.createObjectURL(file)

  // }

  createPdfUrl(base64Data: string): void {
    try {
      const cleanBase64Data = this.stripDataUrlPrefix(base64Data);
      const binaryString = window.atob(cleanBase64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(blob);

      console.log('Blob created:', blob);
      console.log('Object URL created:', objectUrl);

      this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
    } catch (e) {
      console.error('Error creating PDF URL:', e);
    }
  }

  private stripDataUrlPrefix(dataUrl: string): string {
    const prefix = 'data:application/pdf;base64,';
    if (dataUrl.startsWith(prefix)) {
      return dataUrl.substring(prefix.length);
    }
    return dataUrl;
  }

  ngOnInit(): void {}

  onClose() {
    this.dialogRef.close();
  }
}
