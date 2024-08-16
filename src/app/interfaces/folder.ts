export interface Folder {
    id: number;                     
    name: string;                   
    parentFolderId: number;         
    createdDate: string;           
    description: string;            
    files: any[];                    
    icon: string;                   
    owner: string;                 
    permissions: string;            
    tags: string;                   
    type: string;                   
    childFolders?: Folder[];        
  }
  