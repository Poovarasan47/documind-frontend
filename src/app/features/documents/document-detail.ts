import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DocumentService, DocumentResponse } from '../../core/services/document';
import { AiService } from '../../core/services/ai';


interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatToolbarModule
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>Document Details</span>
    </mat-toolbar>

    <div class="detail-container">
      @if (loading()) {
        <div class="loading">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        </div>
      } @else if (document()) {
        <div class="detail-content">
          <!-- Document Info Card -->
          <mat-card class="info-card">
            <mat-card-header>
              <div class="doc-icon-large">{{ getFileIcon(document()!.fileType) }}</div>
              <mat-card-title>{{ document()!.fileName }}</mat-card-title>
              <mat-card-subtitle>
                {{ formatFileSize(document()!.fileSize) }} • 
                {{ formatDate(document()!.uploadedAt) }}
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Category:</strong>
                  <mat-chip-set>
                    <mat-chip highlighted>{{ document()!.category }}</mat-chip>
                  </mat-chip-set>
                </div>
                
                <div class="info-item">
                  <strong>File Type:</strong>
                  <span>{{ document()!.fileType }}</span>
                </div>
              </div>

              @if (document()!.aiSummary) {
                <div class="ai-summary-section">
                  <h3>🤖 AI Summary</h3>
                  <p>{{ document()!.aiSummary }}</p>
                </div>
              }
            </mat-card-content>

            <mat-card-actions>
              <button mat-raised-button color="primary" (click)="downloadDoc()">
                <mat-icon>download</mat-icon>
                Download
              </button>
              <button mat-raised-button (click)="regenerateSummary()" [disabled]="regenerating()">
                @if (regenerating()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <mat-icon>refresh</mat-icon>
                }
                Regenerate Summary
              </button>
            </mat-card-actions>
          </mat-card>

          <!-- AI Chat Section -->
          <mat-card class="chat-card">
            <mat-card-header>
              <mat-card-title>💬 Ask Questions About This Document</mat-card-title>
              <mat-card-subtitle>AI will answer based on the document content</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <!-- Chat Messages -->
              <div class="chat-messages" #chatContainer>
                @if (chatMessages().length === 0) {
                  <div class="chat-empty">
                    <mat-icon class="chat-empty-icon">chat_bubble_outline</mat-icon>
                    <p>Start asking questions about this document!</p>
                    <div class="suggested-questions">
                      <p><strong>Try asking:</strong></p>
                      <button mat-stroked-button (click)="askSuggested('What is this document about?')">
                        What is this document about?
                      </button>
                      <button mat-stroked-button (click)="askSuggested('Summarize the main points')">
                        Summarize the main points
                      </button>
                      <button mat-stroked-button (click)="askSuggested('What are the key takeaways?')">
                        What are the key takeaways?
                      </button>
                    </div>
                  </div>
                } @else {
                  @for (message of chatMessages(); track $index) {
                    <div class="message" [class.user-message]="message.type === 'user'" 
                         [class.ai-message]="message.type === 'ai'">
                      <div class="message-avatar">
                        @if (message.type === 'user') {
                          <mat-icon>person</mat-icon>
                        } @else {
                          <mat-icon>smart_toy</mat-icon>
                        }
                      </div>
                      <div class="message-content">
                        <div class="message-text">{{ message.text }}</div>
                        <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                      </div>
                    </div>
                  }
                }
                
                @if (askingQuestion()) {
                  <div class="message ai-message">
                    <div class="message-avatar">
                      <mat-icon>smart_toy</mat-icon>
                    </div>
                    <div class="message-content">
                      <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Chat Input -->
              <div class="chat-input">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Ask a question...</mat-label>
                  <input matInput 
                         [(ngModel)]="question" 
                         (keyup.enter)="askQuestion()"
                         [disabled]="askingQuestion()"
                         placeholder="e.g., What is the main topic of this document?">
                  <button mat-icon-button matSuffix 
                          (click)="askQuestion()" 
                          [disabled]="!question.trim() || askingQuestion()"
                          color="primary">
                    <mat-icon>send</mat-icon>
                  </button>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .detail-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    @media (max-width: 968px) {
      .detail-content {
        grid-template-columns: 1fr;
      }
    }

    /* Info Card */
    .info-card {
      height: fit-content;
    }

    .doc-icon-large {
      font-size: 48px;
      margin-right: 16px;
    }

    .info-grid {
      display: grid;
      gap: 16px;
      margin-top: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-item strong {
      color: #667eea;
    }

    .ai-summary-section {
      margin-top: 24px;
      padding: 20px;
      background: #f0f2ff;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .ai-summary-section h3 {
      margin: 0 0 12px 0;
      color: #667eea;
    }

    .ai-summary-section p {
      margin: 0;
      line-height: 1.6;
      color: #333;
    }

    /* Chat Card */
    .chat-card {
      display: flex;
      flex-direction: column;
      max-height: 700px;
    }

    mat-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #f9fafb;
      border-radius: 8px;
      min-height: 400px;
      max-height: 500px;
    }

    .chat-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
    }

    .chat-empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ddd;
      margin-bottom: 16px;
    }

    .suggested-questions {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }

    .suggested-questions p {
      margin-bottom: 12px;
      color: #666;
    }

    /* Chat Messages */
    .message {
      display: flex;
      gap: 12px;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .user-message {
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-message .message-avatar {
      background: #667eea;
      color: white;
    }

    .ai-message .message-avatar {
      background: #e0e7ff;
      color: #667eea;
    }

    .message-content {
      max-width: 70%;
    }

    .user-message .message-content {
      text-align: right;
    }

    .message-text {
      padding: 12px 16px;
      border-radius: 16px;
      word-wrap: break-word;
      line-height: 1.5;
    }

    .user-message .message-text {
      background: #667eea;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .ai-message .message-text {
      background: white;
      color: #333;
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 4px;
    }

    .message-time {
      font-size: 11px;
      color: #999;
      margin-top: 4px;
      padding: 0 8px;
    }

    /* Typing Indicator */
    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: white;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #667eea;
      animation: typing 1.4s infinite;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.7;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }

    /* Chat Input */
    .chat-input {
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class DocumentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private documentService = inject(DocumentService);
  private aiService = inject(AiService);

  document = signal<DocumentResponse | null>(null);
  loading = signal(true);
  regenerating = signal(false);
  askingQuestion = signal(false);
  
  chatMessages = signal<ChatMessage[]>([]);
  question = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDocument(+id);
    }
  }

  loadDocument(id: number) {
    this.loading.set(true);
    this.documentService.getDocument(id).subscribe({
      next: (doc) => {
        this.document.set(doc);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Failed to load document');
        this.goBack();
      }
    });
  }

  askQuestion() {
    if (!this.question.trim() || !this.document()) return;

    const userMessage: ChatMessage = {
      type: 'user',
      text: this.question,
      timestamp: new Date()
    };

    this.chatMessages.update(msgs => [...msgs, userMessage]);
    
    const currentQuestion = this.question;
    this.question = '';
    this.askingQuestion.set(true);

    this.aiService.askQuestion(this.document()!.id, currentQuestion).subscribe({
      next: (response) => {
        const aiMessage: ChatMessage = {
          type: 'ai',
          text: response.answer,
          timestamp: new Date()
        };
        this.chatMessages.update(msgs => [...msgs, aiMessage]);
        this.askingQuestion.set(false);
        this.scrollToBottom();
      },
      error: () => {
        const errorMessage: ChatMessage = {
          type: 'ai',
          text: 'Sorry, I encountered an error processing your question. Please try again.',
          timestamp: new Date()
        };
        this.chatMessages.update(msgs => [...msgs, errorMessage]);
        this.askingQuestion.set(false);
      }
    });
  }

  askSuggested(suggestedQuestion: string) {
    this.question = suggestedQuestion;
    this.askQuestion();
  }

  regenerateSummary() {
    if (!this.document()) return;
    
    this.regenerating.set(true);
    this.aiService.summarize(this.document()!.id).subscribe({
      next: (response) => {
        this.document.update(doc => {
          if (doc) {
            return { ...doc, aiSummary: response.summary };
          }
          return doc;
        });
        this.regenerating.set(false);
      },
      error: () => {
        this.regenerating.set(false);
        alert('Failed to regenerate summary');
      }
    });
  }

  downloadDoc() {
    if (!this.document()) return;
    
    this.documentService.downloadDocument(this.document()!.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.document()!.fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        alert('Download failed');
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.chat-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  getFileIcon(fileType: string): string {
    return this.documentService.getFileIcon(fileType);
  }

  formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}