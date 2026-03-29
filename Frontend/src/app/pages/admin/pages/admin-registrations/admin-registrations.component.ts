import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-admin-registrations',
  templateUrl: './admin-registrations.component.html',
  styleUrls: ['./admin-registrations.component.css'],
})
export class AdminRegistrationsComponent implements OnInit {
  readonly Math = Math;
  registrations: any[] = [];
  searchQuery = '';
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50];
  totalPages = 0;
  totalRecords = 0;
  isLoading = false;

  sortBy = 'createdAt';
  sortOrder: SortOrder = 'desc';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.isLoading = true;
    const loader = this.searchQuery.trim()
      ? this.adminService.searchUsers(this.searchQuery, this.currentPage, this.pageSize)
      : this.adminService.getRegistrationList(
          this.currentPage,
          this.pageSize,
          this.sortBy,
          this.sortOrder
        );

    loader.subscribe(
      (response: any) => {
        this.registrations = response.data || [];
        this.totalRecords = response.total || 0;
        this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadRegistrations();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadRegistrations();
  }

  setSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.loadRegistrations();
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'fa-sort';
    return this.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadRegistrations();
  }

  goToFirstPage(): void {
    if (this.currentPage === 1) return;
    this.currentPage = 1;
    this.loadRegistrations();
  }

  previousPage(): void {
    if (this.currentPage <= 1) return;
    this.currentPage -= 1;
    this.loadRegistrations();
  }

  nextPage(): void {
    if (this.currentPage >= this.totalPages) return;
    this.currentPage += 1;
    this.loadRegistrations();
  }

  goToLastPage(): void {
    if (this.currentPage === this.totalPages) return;
    this.currentPage = this.totalPages;
    this.loadRegistrations();
  }

  goToPage(page: number | string): void {
    if (typeof page !== 'number' || page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadRegistrations();
  }

  getPaginationPages(): Array<number | string> {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 10) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: Array<number | string> = [1];
    if (current > 4) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let p = start; p <= end; p += 1) pages.push(p);
    if (current < total - 3) pages.push('...');
    pages.push(total);
    return pages;
  }
}

