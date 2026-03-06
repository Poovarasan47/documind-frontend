import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

export interface DocumentResponse {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  aiSummary: string | null;
  uploadedAt: string;
  downloadUrl: string;
}

export interface UploadResponse {
  message: string;
  fileName: string;
  documentId: number;
  downloadUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  
  // Signal to track documents
  documents = signal<DocumentResponse[]>([]);
  
  uploadDocument(file: File, category?: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }
    
    return this.http.post<UploadResponse>(`${environment.apiUrl}/documents/upload`, formData);
  }
  
  getMyDocuments(): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${environment.apiUrl}/documents/my-documents`);
  }
  
  getDocument(id: number): Observable<DocumentResponse> {
    return this.http.get<DocumentResponse>(`${environment.apiUrl}/documents/${id}`);
  }
  
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/documents/download/${id}`, {
      responseType: 'blob'
    });
  }
  
  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/documents/${id}`);
  }
  
  // Helper to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
  
  // Helper to get file icon
  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('text')) return '📃';
    return '📁';
  }
}