import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-admin-contacts',
  templateUrl: './admin-contacts.component.html',
  styleUrls: ['./admin-contacts.component.css'],
})
export class AdminContactsComponent implements OnInit {
  readonly Math = Math;
  contacts: any[] = [];
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
  selectedContact: any = null;
  formData = {
    status: 'new',
    reply: '',
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.isLoading = true;
    const loader = this.searchQuery.trim()
      ? this.adminService.searchContacts(this.searchQuery, this.currentPage, this.pageSize)
      : this.adminService.getAllContacts(this.currentPage, this.pageSize, this.sortBy, this.sortOrder);

    loader.subscribe(
      (response: any) => {
        this.contacts = response.data || [];
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
    this.loadContacts();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadContacts();
  }

  setSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.loadContacts();
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'fa-sort';
    return this.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  openEditModal(contact: any): void {
    this.selectedContact = contact;
    this.formData = {
      status: contact.status || 'new',
      reply: contact.reply || '',
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedContact = null;
  }

  saveContact(): void {
    if (!this.selectedContact) return;
    this.adminService.updateContact(this.selectedContact.id, this.formData).subscribe(() => {
      this.closeModal();
      this.loadContacts();
    });
  }

  deleteContact(id: string): void {
    if (!confirm('Delete this contact message?')) return;
    this.adminService.deleteContact(id).subscribe(() => this.loadContacts());
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadContacts();
  }

  goToFirstPage(): void {
    if (this.currentPage === 1) return;
    this.currentPage = 1;
    this.loadContacts();
  }

  previousPage(): void {
    if (this.currentPage <= 1) return;
    this.currentPage -= 1;
    this.loadContacts();
  }

  nextPage(): void {
    if (this.currentPage >= this.totalPages) return;
    this.currentPage += 1;
    this.loadContacts();
  }

  goToLastPage(): void {
    if (this.currentPage === this.totalPages) return;
    this.currentPage = this.totalPages;
    this.loadContacts();
  }

  goToPage(page: number | string): void {
    if (typeof page !== 'number' || page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadContacts();
  }

  getPaginationPages(): Array<number | string> {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 10) return Array.from({ length: total }, (_, i) => i + 1);
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

