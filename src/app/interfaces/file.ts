export interface File {
    name: string;
    type: string; // 'file' or 'folder'
    children?: File[];
    content?:string,
  
  }