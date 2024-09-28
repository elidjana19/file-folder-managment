import { Component, HostListener, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ClickTrackerServiceService } from '../../click-tracker-service.service';

@Component({
  selector: 'app-file-preview',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './file-preview.component.html',
  styleUrl: './file-preview.component.css',
})
export class FilePreviewComponent {
  decodedText: any;
  safePdfUrl!: SafeResourceUrl;
  name!: string;
  imgUrl: any;
  pdf:any

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<FilePreviewComponent>,
    private clickTrackerService: ClickTrackerServiceService,
    private sanitizer: DomSanitizer
  ) {
    console.log(this.data, 'DATAAAAAAAAA');
    console.log(this.data.base64Data, 'Base 64 data');

    if (data.contentType === 'text/plain') {
      this.decodedText = this.decodeBase64(data);
    }

    if (data.contentType === 'application/pdf') {
      console.log('PDF HERE');
      const decoded= this.decodeBase64PDF(data)
      console.log(decoded, 'DECODED ');
      this.safePdfUrl = this.createPdfUrl(decoded)
      console.log(this.safePdfUrl, 'PDF SAFE URL ');
    }

    this.name = data.name;
  }

  @HostListener('click')
  onClick() {
    this.clickTrackerService.setInside(true);
  }



  decodeBase64(data: any): any {
    const base64String =
      typeof data === 'object' && data !== null && 'base64Data' in data
        ? data.base64Data
        : data;

    console.log('base64String:', base64String);
    console.log('Type of base64String:', typeof base64String);

    if (typeof base64String === 'string') {
      const base64Prefix = 'data:text/plain,base64:';
      const pdfPrefix = 'data:application/pdf,base64:';
      if (
        base64String.startsWith(base64Prefix) || base64String.startsWith(pdfPrefix)
      ) {
        console.log("ifffff")
        const actualBase64 = base64String.substring(base64Prefix.length);
        console.log(actualBase64, "ACTUAL BASE 64")
        try {
          return atob(actualBase64);
        } catch (e) {
          console.error('Failed to decode Base64 string:', e);
          return null;
        }
      } else {
        console.error('Invalid Base64 string: Missing prefix');
        return null;
      }
    } else {
      console.error('Input is not a string:', base64String);
      return null;
    }
  }



  decodeBase64PDF(data: any): any {
    const base64String =
      typeof data === 'object' && data !== null && 'base64Data' in data
        ? data.base64Data
        : data;

    console.log('base64String:', base64String);
    console.log('Type of base64String:', typeof base64String);

    if (typeof base64String === 'string') {
      const pdfPrefix = 'data:application/pdf,base64:';
      if (
        base64String.startsWith(pdfPrefix)
      ) {
        console.log("ifffff")
        const actualBase64 = base64String.substring(pdfPrefix.length);
        console.log(actualBase64, "ACTUAL BASE 64")
        try {
          return atob(actualBase64);
        } catch (e) {
          console.error('Failed to decode Base64 string:', e);
          return null;
        }
      } else {
        console.error('Invalid Base64 string: Missing prefix');
        return null;
      }
    } else {
      console.error('Input is not a string:', base64String);
      return null;
    }
  }


  createPdfUrl(base64Data: string): SafeResourceUrl {
    const len = base64Data.length;
    const bytes = new Uint8Array(len);
  
    for (let i = 0; i < len; i++) {
      bytes[i] = base64Data.charCodeAt(i);
    }
  
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const objectUrl = URL.createObjectURL(blob);
  
    return this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
  }


  ngOnInit(): void {}


  onClose() {
    this.dialogRef.close();
  }
}
