import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
})
export class AdminUsersComponent implements OnInit {
  readonly Math = Math;
  users: any[] = [];
  searchQuery = '';
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50];
  totalPages = 0;
  totalRecords = 0;
  isLoading = false;
  showModal = false;
  isEditMode = false;
  selectedUser: any = null;
  sortBy = 'createdAt';
  sortOrder: SortOrder = 'desc';

  formData = {
    username: '',
    name: '',
    email: '',
    password: '',
    phoneNo: '',
    role: 'user',
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    const loader = this.searchQuery.trim()
      ? this.adminService.searchUsers(this.searchQuery, this.currentPage, this.pageSize)
      : this.adminService.getAllUsers(
          this.currentPage,
          this.pageSize,
          this.sortBy,
          this.sortOrder
        );

    loader.subscribe(
      (response: any) => {
        const rows = Array.isArray(response?.data) ? response.data : [];
        this.users = rows
          .filter((row: any) => row && (row.id || row._id))
          .map((row: any) => ({
            ...row,
            id: String(row.id || row._id),
            username: row.username || '-',
            name: row.name || '-',
            email: row.email || '-',
            phoneNo: row.phoneNo || '-',
            role: row.role || 'user',
            createdAt: row.createdAt || row.updatedAt || new Date().toISOString(),
          }));
        this.totalRecords = response.total || 0;
        this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    );
  }

  searchUsers(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  setSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.loadUsers();
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'fa-sort';
    return this.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.formData = {
      username: '',
      name: '',
      email: '',
      password: '',
      phoneNo: '',
      role: 'user',
    };
    this.showModal = true;
    this.selectedUser = null;
  }

  openEditModal(user: any): void {
    this.isEditMode = true;
    this.selectedUser = user;
    this.formData = { ...user, password: '' };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveUser(): void {
    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    this.adminService.createUser(this.formData).subscribe(
      () => {
        this.loadUsers();
        this.closeModal();
      },
      (error) => {
        console.error('Error creating user:', error);
      }
    );
  }

  updateUser(): void {
    if (!this.selectedUser) return;
    this.adminService.updateUser(this.getUserId(this.selectedUser), this.formData).subscribe(
      (response) => {
        this.loadUsers();
        this.closeModal();
      },
      (error) => {
        console.error('Error updating user:', error);
      }
    );
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(id).subscribe(
        (response) => {
          this.loadUsers();
        },
        (error) => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  goToFirstPage(): void {
    if (this.currentPage === 1) return;
    this.currentPage = 1;
    this.loadUsers();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  goToLastPage(): void {
    if (this.currentPage === this.totalPages) return;
    this.currentPage = this.totalPages;
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
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

  getUserId(user: any): string {
    return String(user?.id || user?._id || '');
  }

  getRecordStart(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getRecordEnd(): number {
    if (this.totalRecords === 0) return 0;
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }
}

