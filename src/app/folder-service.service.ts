import { Injectable } from '@angular/core';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  Subject,
  take,
  tap,
  throwError,
} from 'rxjs';

import { Folder } from './interfaces/folder';
import { Filee } from './interfaces/filee';

@Injectable({
  providedIn: 'root',
})
export class FolderServiceService {
  private folderStack: any[] = [];

  apiUrl = 'http://localhost:5103/api/Folders';
  fileUrl = 'http://localhost:5103/api/Files';

  constructor(private http: HttpClient) {}


  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  
  private handleError(error: any) {
    console.error('API Error: ', error);
    return throwError(error);
  }

  getAllFolders(): Observable<any[]> {
    return this.http.get<Folder[]>(this.apiUrl,  {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  getFolderById(folderId: number): Observable<any> {
    const url = `${this.apiUrl}/${folderId}`;
    return this.http.get<Folder>(url, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  createFolder(folderName: string, parentId: number, type:string): Observable<any> {
    const body = { name: folderName, parentFolderId: parentId , type:'folder'};
    return this.http.post<Folder>(this.apiUrl, body,  {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.folderChangeSubject.next()),
      catchError(this.handleError)
    );
  }

  renameFolder(folderId: number, newName: string): Observable<any> {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
    const body = JSON.stringify(newName);
    return this.http
      .put(`${this.apiUrl}/rename/${folderId}`, body, { headers })  //noo 
      .pipe(
        tap(() => this.folderChangeSubject.next()),
        catchError(this.handleError)
      );
  }

  renameFile(fileId: number, newName: string):Observable<any>{
    
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');
    const body = JSON.stringify(newName);
    return this.http
      .put(`${this.fileUrl}/rename/${fileId}`, body, { headers })
      .pipe(
        tap(() => this.folderChangeSubject.next()),
        catchError(this.handleError)
      );

  }
  deleteFolder(folderId: number): Observable<void> {
    const url = `${this.apiUrl}/${folderId}`;
    return this.http.delete<void>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.folderChangeSubject.next()),
      catchError(this.handleError)
    );
  }

  deleteFile(fileId:number):Observable<void>{
    const url= `${this.fileUrl}/${fileId}`
    return this.http.delete<void>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(()=>this.fileChangeSubject.next()),
      catchError(this.handleError)
    )

  }
  
  uploadFile(folderId: number, file: File): Observable<any> {
    const url = `${this.fileUrl}/upload?folderId=${folderId}`;
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<any>(url, formData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response) => this.fileChangeSubject.next()),
      catchError(this.handleError)
    );
  }

  downloadFile(fileId: number): Observable<Blob> {
    return this.http
      .get<Blob>(`${this.fileUrl}/${fileId}/download`, {
        responseType: 'blob' as 'json',
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap(() => this.folderChangeSubject.next()),
        catchError(this.handleError)
      );
  }

  getFileById(fileId: number): Observable<Blob> {
    return this.http.get<Blob>(`${this.fileUrl}/${fileId}`, {
      responseType: 'blob' as 'json',
      headers: this.getAuthHeaders(),
    });
  }

  getFile(fileId: number): Observable<any> {
    return this.http.get<Filee>(`${this.fileUrl}/${fileId}`, {headers: this.getAuthHeaders()});
  }

  moveFolder(folderId: string, destinationFolderId: any): Observable<void> {
    const url = `${this.apiUrl}/move?folderId=${folderId}&destinationFolderId=${destinationFolderId}`;
    const options = {
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json'
    };
  
    return this.http.post<void>(url, {}, options).pipe(
      tap(() => this.folderChangeSubject.next()),
      catchError(this.handleError)
    );
  }
  
  moveFile(fileId: string, destinationFolderId: any): Observable<void> {
    const url = `${this.fileUrl}/move?fileId=${fileId}&destinationFolderId=${destinationFolderId}`;
  
    const options = {
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json'
    };
  
    return this.http.post<void>(url, {}, options).pipe(
      tap(() => this.fileChangeSubject.next()),
      catchError(this.handleError)
    );
  }
  
// to see folder/file changes
  folderChangeSubject = new Subject<void>();
  folderChanges$ = this.folderChangeSubject.asObservable();

  fileChangeSubject = new Subject<void>();
  fileChanges$ = this.fileChangeSubject.asObservable();
  

  // SELECTED FOLDER
  private selectedFolderSubject = new BehaviorSubject<any | null>(null);
  selectedFolder$ = this.selectedFolderSubject.asObservable();

   // i set the currently selected folder and push the previous selection onto the folder stack
  setSelectedFolder(folder: any) {
    this.folderStack.push(this.selectedFolderSubject.value);

      this.selectedFolderSubject.next(folder)
    
  }

  getSelectedFolder(): Observable<any | null> {
    return this.selectedFolder$;
  }

  deselectFolder() {
    this.selectedFolderSubject.next(null);
  }



  // SELECTED FILE
  private selectedFileSubject = new BehaviorSubject<any | null>(null);
  selectedFile$ = this.selectedFileSubject.asObservable();

  setSelectedFile(file: any) {
      this.selectedFileSubject.next(file)
   
  }

  getSelectedFile(): Observable<any | null> {
    return this.selectedFile$;
  }



  getStackLength() {
    // console.log(this.folderStack.length)
    return this.folderStack.length;
  }

  // Path
  private currentPathSubject = new BehaviorSubject<any>('');
  currentPath$ = this.currentPathSubject.asObservable();

  clearPath() {
    this.currentPathSubject.next([]);  // Clear the path
    
  }

  getPath(): Observable<{ id: number; name: string }[]> {
    return this.currentPath$.pipe(take(1));
  }

  updatePath(path: { id: number; name: string }[]) {
    this.currentPathSubject.next(path);
  }

  async buildPathFromFolder(folder: any): Promise<void> {
    let path = [{ id: folder.id, name: folder.name }];
    let currentFolder = folder;

    while (currentFolder.parentFolderId) {
      try {
        //await until i get data
        currentFolder = await this.getFolderById(  
          currentFolder.parentFolderId
        ).toPromise();
        if (currentFolder) {
          path.unshift({ id: currentFolder.id, name: currentFolder.name });  //add parent to beginning 
        } else {
          console.error('Parent folder not found');
          break;
        }
      } catch (error) {
        console.error('Error fetching parent folder:', error);
        break;
      }
    }

    this.updatePath([...path]);
  }

  

  // batch delete

  deleteFolders(folderIds:number[]):Observable<any>{
    const url= `${this.apiUrl}/delete-folders`
    return this.http.post(url, folderIds, { responseType: 'text' ,   headers: this.getAuthHeaders()}).pipe(
      tap(() => this.folderChangeSubject.next()),
      catchError(this.handleError)
    );
    }

  deleteFiles(fileIds:number[]):Observable<any> {
    const url = `${this.fileUrl}/delete-files`
    return this.http.post(url, fileIds, { responseType: 'text',   headers: this.getAuthHeaders() }).pipe(
      tap(() => this.fileChangeSubject.next()),
      catchError(this.handleError)
    );
  }

  // selected items
  selectedItemsSubject = new BehaviorSubject<{ id: number, type: string }[]>([])
  selectedItems$= this.selectedItemsSubject.asObservable()

  updateSelection(items: { id: number, type: string }[]) {
    this.selectedItemsSubject.next(items);
  }
  
  getSelectedItems() {
    return this.selectedItems$;
  }


  //   //selected item
  private selectedItemSubject = new BehaviorSubject<{ id: number, type: string, name:string } | null>(null);
  selectedItem$ = this.selectedItemSubject.asObservable();

  addSelectedItem(item:any ) {
    this.selectedItemSubject.next(item);

}
clearSelectedItem(): void {
  this.selectedItemSubject.next(null);
}

  // search
  // searchFolder(parentId:number, name:string):Observable<any>{
  //   const url = `${this.apiUrl}/search/${parentId}?name=${name}`
  //   const headers = new HttpHeaders({
  //     'Accept': '*/*'
  //   });
  //   return this.http.get<any>(url, {headers})
  // }

  // searchFile(parentId:number, name:string):Observable<any>{
  //   const url = `${this.fileUrl}/files/searchByName/${parentId}?name=${name}`
  //   const headers = new HttpHeaders({
  //     'Accept': '*/*'
  //   });
  //   return this.http.get<any>(url, {headers})
  // }

  searchFolder(name: string, parentId?: number): Observable<any> {
    let url = `${this.apiUrl}/search?name=${name}`;
    if (parentId !== undefined && parentId !== null) {
      url += `&parentId=${parentId}`;
    }
    return this.http.get<Folder>(url, {
      headers: this.getAuthHeaders()
    });
  }
  
  searchFile(name: string, parentId?: number): Observable<any> {
    let url = `${this.fileUrl}/search?name=${name}`;
    if (parentId !== undefined && parentId !== null) {
      url += `&parentId=${parentId}`;
    }
    return this.http.get<Filee>(url, {
      headers: this.getAuthHeaders()
    });
  }
  
  
  // preview
  preview(fileId:number):Observable<any>{
    const url = `${this.fileUrl}/${fileId}/preview-base64`
    return this.http.get<Filee>(url, {
      headers: this.getAuthHeaders()
    })
  }


  // rollback 

  rollbackFile(fileId: number, targetVersion: number): Observable<any> {
    const url = `${this.fileUrl}/${fileId}/rollback`;
    const body = { fileId, targetVersion };
    return this.http.post<Filee>(url, body, { responseType: 'text' as 'json',   headers: this.getAuthHeaders(), }) .pipe(
      tap(() => this.folderChangeSubject.next()),
      catchError(this.handleError));
  }

  getVersions(fileId:number, path:any):Observable<any>{
    const url= `${this.fileUrl}/${fileId}/versions?filepath=${encodeURIComponent(path)}`
    return this.http.get<Filee>(url, {
      headers: this.getAuthHeaders()
    })
  }


  
  //zip unzip

  zip(folderId:number):Observable<Blob>{
    return this.http.post(`${this.apiUrl}/${folderId}/zip`, {}, {
      responseType: 'blob',   headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => this.folderChangeSubject.next()),
      catchError(this.handleError));
  }

  unzip(folderId:number){
    return this.http.post(`${this.apiUrl}/unzip/${folderId}`, {}, {
      responseType: 'text',   headers: this.getAuthHeaders(),
    }).pipe(
      tap(() => this.folderChangeSubject.next()),
      catchError(this.handleError));
  }
 


}
