import { Component, OnInit } from '@angular/core';
import { TransactionService, Transaction } from '../../core/services/transaction.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  // add-transaction form
  form: Partial<Transaction> = { type: 'Expense', description: '', amount: undefined };
  addError = '';
  adding = false;

  // list state
  transactions: Transaction[] = [];
  total = 0;
  totalPages = 1;
  loading = false;
  listError = '';

  // filters / sort / pagination
  filterType = '';
  dateFrom = '';
  dateTo = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  sortBy: 'date' | 'amount' | 'type' = 'date';
  order: 'asc' | 'desc' = 'desc';
  page = 1;
  limit = 10;

  constructor(private txService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  addTransaction(): void {
    this.addError = '';
    if (!this.form.type || !this.form.description || !this.form.amount) {
      this.addError = 'All fields are required';
      return;
    }
    this.adding = true;
    this.txService.add(this.form).subscribe({
      next: () => {
        this.adding = false;
        this.form = { type: 'Expense', description: '', amount: undefined };
        this.page = 1;
        this.loadTransactions();
      },
      error: (err) => {
        this.adding = false;
        this.addError = err?.error?.message || 'Failed to add transaction';
      },
    });
  }

  loadTransactions(): void {
    this.loading = true;
    this.listError = '';
    this.txService
      .list({
        type: this.filterType || undefined,
        dateFrom: this.dateFrom || undefined,
        dateTo: this.dateTo || undefined,
        minAmount: this.minAmount ?? undefined,
        maxAmount: this.maxAmount ?? undefined,
        sortBy: this.sortBy,
        order: this.order,
        page: this.page,
        limit: this.limit,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.transactions = res.transactions;
          this.total = res.pagination.total;
          this.totalPages = res.pagination.totalPages;
        },
        error: (err) => {
          this.loading = false;
          this.listError = err?.error?.message || 'Failed to load transactions';
        },
      });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterType = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.page = 1;
    this.loadTransactions();
  }

  changeSort(field: 'date' | 'amount' | 'type'): void {
    if (this.sortBy === field) {
      this.order = this.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.order = 'desc';
    }
    this.loadTransactions();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadTransactions();
  }

  deleteTransaction(id?: string): void {
    if (!id) return;
    this.txService.remove(id).subscribe({
      next: () => this.loadTransactions(),
      error: (err) => (this.listError = err?.error?.message || 'Delete failed'),
    });
  }
}
