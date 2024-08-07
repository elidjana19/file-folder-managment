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

@Injectable({
  providedIn: 'root',
})
export class FolderServiceService {
  private folderStack: any[] = [];

  apiUrl = 'http://localhost:5103/api/Folders';
  fileUrl = 'http://localhost:5103/api/Files';

  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    console.error('API Error: ', error);
    return throwError(error);
  }

  getRootFolders(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/root`)
      .pipe(catchError(this.handleError));
  }

  getAllFolders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getFolderById(folderId: number): Observable<any> {
    const url = `${this.apiUrl}/${folderId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  createFolder(folderName: string, parentId: number): Observable<any> {
    const body = { name: folderName, parentFolderId: parentId };
    return this.http.post<any>(this.apiUrl, body).pipe(
      tap(() => this.folderChangeSubject.next()),
      catchError(this.handleError)
    );
  }

  renameFolder(folderId: number, newName: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = JSON.stringify(newName);
    return this.http
      .put(`${this.apiUrl}/rename/${folderId}`, body, { headers })
      .pipe(
        tap(() => this.folderChangeSubject.next()),
        catchError(this.handleError)
      );
  }

  renameFile(fileId: number, newName: string):Observable<any>{
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
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
    return this.http.delete<void>(url).pipe(
      tap(() => this.folderChangeSubject.next()),
      catchError(this.handleError)
    );
  }

  deleteFile(fileId:number):Observable<void>{
    const url= `${this.fileUrl}/${fileId}`
    return this.http.delete<void>(url).pipe(
      tap(()=>this.fileChangeSubject.next()),
      catchError(this.handleError)
    )

  }
  
  uploadFile(folderId: number, file: File): Observable<any> {
    const url = `${this.fileUrl}/upload?folderId=${folderId}`;
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<any>(url, formData).pipe(
      tap((response) => this.fileChangeSubject.next()),
      catchError(this.handleError)
    );
  }

  downloadFile(fileId: number): Observable<Blob> {
    return this.http
      .get<Blob>(`${this.fileUrl}/${fileId}/download`, {
        responseType: 'blob' as 'json',
      })
      .pipe(
        tap(() => this.folderChangeSubject.next()),
        catchError(this.handleError)
      );
  }

  getFileById(fileId: number): Observable<Blob> {
    return this.http.get<Blob>(`${this.fileUrl}/${fileId}`, {
      responseType: 'blob' as 'json',
    });
  }

  getFile(fileId: number): Observable<any> {
    return this.http.get<any>(`${this.fileUrl}/${fileId}`);
  }

  moveFolder(folderId: string, destinationFolderId: any): Observable<void> {
    const url = `${this.apiUrl}/move?folderId=${folderId}&destinationFolderId=${destinationFolderId}`;
    return this.http.post<void>(url, { responseType: 'text' as 'json' }).pipe(
      tap(() => this.folderChangeSubject.next()),
      
      catchError(this.handleError)
    );
  }

  moveFile(fileId: string, destinationFolderId: any): Observable<void> {
    const url = `${this.fileUrl}/move?fileId=${fileId}&destinationFolderId=${destinationFolderId}`;
    return this.http.post<void>(url, { responseType: 'text' as 'json' }).pipe(
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

  goBack() {
    if (this.folderStack.length > 0) {
      const parentFolder = this.folderStack.pop();
      this.selectedFolderSubject.next(parentFolder);
      if (parentFolder) {
        this.buildPathFromFolder(parentFolder).then(() => {
          console.log('Path built successfully');
        });
      }else{
        this.clearPath()  //for root folders
      }
    }
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
    return this.http.post(url, folderIds, { responseType: 'text' }).pipe(
      tap(() => this.folderChangeSubject.next()),
      catchError(this.handleError)
    );
    }

  deleteFiles(fileIds:number[]):Observable<any> {
    const url = `${this.fileUrl}/delete-files`
    return this.http.post(url, fileIds, { responseType: 'text' }).pipe(
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
//   private selectedItemSubject = new BehaviorSubject<{ id: number, type: string } | null>(null);
//   selectedItem$ = this.selectedItemSubject.asObservable();

//   addSelectedItem(item: { id: number, type: string }) {
//     this.selectedItemSubject.next(item);
  
// }

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


  searchFolder(parentId:number, name:string):Observable<any>{
    const url = `${this.apiUrl}/search/${parentId}?name=${name}`
    return this.http.get<any>(url)
  }

  searchFile(parentId:number, name:string):Observable<any>{
    const url = `${this.fileUrl}/files/searchByName/${parentId}?name=${name}`
    return this.http.get<any>(url)
  }



  // preview
  preview(fileId:number):Observable<any>{
    const url = `${this.fileUrl}/${fileId}/preview-base64`
    return this.http.get<any>(url)
  }


  // rollback 

  rollbackFile(fileId: number, targetVersion: number): Observable<any> {
    const url = `${this.fileUrl}/${fileId}/rollback`;
    const body = { fileId, targetVersion };
    return this.http.post<any>(url, body, { responseType: 'text' as 'json' }) .pipe(catchError(this.handleError));
  }

  getVersions(fileId:number, path:any):Observable<any>{
    const url= `${this.fileUrl}/${fileId}/versions?filepath=${encodeURIComponent(path)}`
    return this.http.get<any>(url)
  }

}
