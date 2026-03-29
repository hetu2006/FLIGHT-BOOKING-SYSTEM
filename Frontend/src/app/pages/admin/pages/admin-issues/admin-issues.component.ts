import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-admin-issues',
  templateUrl: './admin-issues.component.html',
  styleUrls: ['./admin-issues.component.css'],
})
export class AdminIssuesComponent implements OnInit {
  readonly Math = Math;

  issues: any[] = [];
  searchQuery = '';
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50];
  totalPages = 0;
  totalRecords = 0;
  isLoading = false;

  sortBy = 'createdAt';
  sortOrder: SortOrder = 'desc';

  showModal = false;
  isEditMode = false;
  selectedIssue: any = null;

  formData = {
    userIdentifier: '',
    subject: '',
    description: '',
    issueType: 'General',
    status: 'open',
    resolution: '',
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadIssues();
  }

  loadIssues(): void {
    this.isLoading = true;

    const loader = this.searchQuery.trim()
      ? this.adminService.searchIssues(this.searchQuery, this.currentPage, this.pageSize)
      : this.adminService.getAllIssues(
          this.currentPage,
          this.pageSize,
          this.sortBy,
          this.sortOrder
        );

    loader.subscribe(
      (response: any) => {
        this.issues = response.data || [];
        this.totalRecords = response.total || 0;
        this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading issues:', error);
        this.isLoading = false;
      }
    );
  }

  searchIssues(): void {
    this.currentPage = 1;
    this.loadIssues();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadIssues();
  }

  setSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.loadIssues();
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'fa-sort';
    return this.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedIssue = null;
    this.formData = {
      userIdentifier: '',
      subject: '',
      description: '',
      issueType: 'General',
      status: 'open',
      resolution: '',
    };
    this.showModal = true;
  }

  openEditModal(issue: any): void {
    this.isEditMode = true;
    this.selectedIssue = issue;
    this.formData = {
      userIdentifier: issue.username || issue.email || issue.userId || '',
      subject: issue.subject || '',
      description: issue.description || '',
      issueType: issue.issueType || 'General',
      status: this.normalizeStatus(issue.status),
      resolution: issue.resolution || '',
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveIssue(): void {
    if (this.isEditMode) {
      this.updateIssue();
    } else {
      this.createIssue();
    }
  }

  createIssue(): void {
    this.adminService.createIssue(this.formData).subscribe(
      () => {
        this.loadIssues();
        this.closeModal();
      },
      (error) => {
        console.error('Error creating issue:', error);
      }
    );
  }

  updateIssue(): void {
    if (!this.selectedIssue) return;

    const payload = {
      subject: this.formData.subject,
      description: this.formData.description,
      issueType: this.formData.issueType,
      status: this.formData.status,
      resolution: this.formData.resolution,
    };

    this.adminService.updateIssue(this.getIssueId(this.selectedIssue), payload).subscribe(
      () => {
        this.loadIssues();
        this.closeModal();
      },
      (error) => {
        console.error('Error updating issue:', error);
      }
    );
  }

  deleteIssue(id: string): void {
    if (!confirm('Are you sure you want to delete this issue?')) return;

    this.adminService.deleteIssue(id).subscribe(
      () => this.loadIssues(),
      (error) => {
        console.error('Error deleting issue:', error);
      }
    );
  }

  getStatusBadgeClass(status: string): string {
    const value = this.normalizeStatus(status);
    if (value === 'resolved') return 'badge-success';
    if (value === 'open') return 'badge-warning';
    if (value === 'in-progress') return 'badge-info';
    if (value === 'closed') return 'badge-danger';
    return 'badge-secondary';
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadIssues();
  }

  goToFirstPage(): void {
    if (this.currentPage === 1) return;
    this.currentPage = 1;
    this.loadIssues();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.loadIssues();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      this.loadIssues();
    }
  }

  goToLastPage(): void {
    if (this.currentPage === this.totalPages) return;
    this.currentPage = this.totalPages;
    this.loadIssues();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadIssues();
    }
  }

  getPaginationPages(): number[] {
    if (this.totalPages <= 10) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const pages: number[] = [1];
    const startPage = Math.max(2, this.currentPage - 1);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = startPage; i <= endPage; i += 1) pages.push(i);
    if (!pages.includes(this.totalPages)) pages.push(this.totalPages);
    return pages;
  }

  getIssueId(issue: any): string {
    return String(issue?.id || issue?._id || '');
  }

  getRecordStart(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getRecordEnd(): number {
    if (this.totalRecords === 0) return 0;
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  normalizeStatus(status: string): string {
    const value = String(status || '').toLowerCase();
    if (value === 'in progress') return 'in-progress';
    return value || 'open';
  }
}

