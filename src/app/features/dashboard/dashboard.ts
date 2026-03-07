import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { DocumentResponse, DocumentService } from '../../core/services/document';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>🤖 DocuMind AI</span>
      <span class="spacer"></span>
      <span>Welcome, {{ authService.getFullName() }}!</span>
      <button mat-button (click)="logout()">
        <mat-icon>logout</mat-icon>
        Logout
      </button>
    </mat-toolbar>
    
    <div class="dashboard-content">
      <!-- Upload Section -->
      <div class="upload-section">
        <h1>📁 My Documents</h1>
        
        <div class="upload-card" 
             (click)="fileInput.click()"
             (dragover)="onDragOver($event)"
             (drop)="onDrop($event)">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <h3>Click to upload or drag & drop</h3>
          <p>PDF, DOCX, TXT, Images (Max 10MB)</p>
          <input #fileInput type="file" hidden (change)="onFileSelected($event)"
                 accept=".pdf,.docx,.txt,.png,.jpg,.jpeg">
        </div>
        
        @if (uploading()) {
          <div class="upload-progress">
            <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
            <p>Uploading and processing with AI...</p>
          </div>
        }
      </div>
      
      <!-- Documents List -->
      <div class="documents-section">
        @if (loading()) {
          <div class="loading-state">
            <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
            <p>Loading documents...</p>
          </div>
        } @else if (documents().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">description</mat-icon>
            <h2>No documents yet</h2>
            <p>Upload your first document to get started!</p>
          </div>
        } @else {
          <div class="documents-grid">
            @for (doc of documents(); track doc.id) {
              <mat-card class="document-card">
                <mat-card-header>
                  <div class="doc-icon">{{ getFileIcon(doc.fileType) }}</div>
                  <mat-card-title>{{ doc.fileName }}</mat-card-title>
                  <mat-card-subtitle>
                    {{ formatFileSize(doc.fileSize) }} • {{ formatDate(doc.uploadedAt) }}
                  </mat-card-subtitle>
                </mat-card-header>
                
                <mat-card-content>
                  <mat-chip-set>
                    <mat-chip highlighted>{{ doc.category }}</mat-chip>
                  </mat-chip-set>
                  
                  @if (doc.aiSummary) {
                    <div class="ai-summary">
                      <strong>🤖 AI Summary:</strong>
                      <p>{{ doc.aiSummary }}</p>
                    </div>
                  }
                </mat-card-content>
                
                <mat-card-actions>
                  <button mat-button color="primary" (click)="downloadDoc(doc.id, doc.fileName)">
                    <mat-icon>download</mat-icon>
                    Download
                  </button>
                  <button mat-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewDetails(doc)">
                      <mat-icon>info</mat-icon>
                      View Details
                    </button>
                    <button mat-menu-item (click)="deleteDoc(doc.id)">
                      <mat-icon color="warn">delete</mat-icon>
                      Delete
                    </button>
                  </mat-menu>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    
    .dashboard-content {
      padding: 30px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    h1 {
      color: #667eea;
      margin-bottom: 30px;
    }
    
    /* Upload Section */
    .upload-section {
      margin-bottom: 50px;
    }
    
    .upload-card {
      border: 3px dashed #667eea;
      border-radius: 12px;
      padding: 60px 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8f9ff;
    }
    
    .upload-card:hover {
      border-color: #764ba2;
      background: #f0f2ff;
      transform: translateY(-2px);
    }
    
    .upload-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #667eea;
      margin-bottom: 20px;
    }
    
    .upload-card h3 {
      color: #333;
      margin-bottom: 10px;
    }
    
    .upload-card p {
      color: #666;
    }
    
    .upload-progress {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;
      padding: 20px;
      background: #f0f2ff;
      border-radius: 8px;
    }
    
    /* Documents Grid */
    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }
    
    .document-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .document-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    
    .doc-icon {
      font-size: 32px;
      margin-right: 12px;
    }
    
    mat-card-header {
      align-items: center;
    }
    
    mat-card-title {
      font-size: 16px;
      font-weight: 600;
    }
    
    mat-card-subtitle {
      font-size: 12px;
      color: #666;
    }
    
    .ai-summary {
      margin-top: 16px;
      padding: 12px;
      background: #f0f2ff;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    
    .ai-summary strong {
      color: #667eea;
      display: block;
      margin-bottom: 8px;
    }
    
    .ai-summary p {
      margin: 0;
      font-size: 13px;
      color: #333;
      line-height: 1.5;
    }
    
    /* Loading & Empty States */
    .loading-state,
    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }
    
    .empty-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ccc;
      margin-bottom: 20px;
    }
    
    .empty-state h2 {
      color: #666;
      margin-bottom: 10px;
    }
    
    .empty-state p {
      color: #999;
    }
    
    /* Actions */
    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 16px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private documentService = inject(DocumentService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  
  documents = signal<DocumentResponse[]>([]);
  loading = signal(false);
  uploading = signal(false);
  
  ngOnInit() {
    this.loadDocuments();
  }
  
  loadDocuments() {
    this.loading.set(true);
    this.documentService.getMyDocuments().subscribe({
      next: (docs) => {
        this.documents.set(docs);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open('Failed to load documents', 'Close', { duration: 3000 });
      }
    });
  }
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFile(files[0]);
    }
  }
  
  uploadFile(file: File) {
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.snackBar.open('File size must be less than 10MB', 'Close', { duration: 3000 });
      return;
    }
    
    this.uploading.set(true);
    this.documentService.uploadDocument(file).subscribe({
      next: (response) => {
        this.uploading.set(false);
        this.snackBar.open('✅ File uploaded and processed with AI!', 'Close', { duration: 3000 });
        this.loadDocuments(); // Reload list
      },
      error: (err) => {
        this.uploading.set(false);
        this.snackBar.open('Upload failed: ' + (err.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
      }
    });
  }
  
  downloadDoc(id: number, fileName: string) {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Download started!', 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Download failed', 'Close', { duration: 3000 });
      }
    });
  }
  
  deleteDoc(id: number) {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.snackBar.open('Document deleted', 'Close', { duration: 2000 });
          this.loadDocuments();
        },
        error: () => {
          this.snackBar.open('Delete failed', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
  viewDetails(doc: DocumentResponse) {
  this.router.navigate(['/document', doc.id]);
}
  
  formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }
  
  getFileIcon(fileType: string): string {
    return this.documentService.getFileIcon(fileType);
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  logout() {
    this.authService.logout();
  }
}
