import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Transaction {
  _id?: string;
  type: 'Income' | 'Expense';
  description: string;
  amount: number;
  date: string;
}

export interface TransactionQuery {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TransactionResponse {
  transactions: Transaction[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly base = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  add(tx: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<Transaction>(this.base, tx);
  }

  list(query: TransactionQuery): Observable<TransactionResponse> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<TransactionResponse>(this.base, { params });
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
