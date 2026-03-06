import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SummaryResponse {
  summary: string;
  documentId: string;
}

export interface QuestionResponse {
  question: string;
  answer: string;
  documentId: string;
}

export interface ClassifyResponse {
  category: string;
  documentId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);
  
  summarize(documentId: number): Observable<SummaryResponse> {
    return this.http.post<SummaryResponse>(`${environment.apiUrl}/ai/summarize/${documentId}`, {});
  }
  
  askQuestion(documentId: number, question: string): Observable<QuestionResponse> {
    return this.http.post<QuestionResponse>(`${environment.apiUrl}/ai/ask/${documentId}`, { question });
  }
  
  classify(documentId: number): Observable<ClassifyResponse> {
    return this.http.post<ClassifyResponse>(`${environment.apiUrl}/ai/classify/${documentId}`, {});
  }
  
  extractKeyPoints(documentId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/ai/key-points/${documentId}`, {});
  }
}