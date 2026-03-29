import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './admin-bookings.component.html',
  styleUrls: ['./admin-bookings.component.css'],
})
export class AdminBookingsComponent implements OnInit {
  readonly Math = Math;

  bookings: any[] = [];
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
  selectedBooking: any = null;

  formData = {
    userIdentifier: '',
    flightIdentifier: '',
    classType: 'economy',
    status: 'pending',
    totalPrice: 0,
    numberOfPassengers: 1,
    paymentMethod: '',
    paymentStatus: 'pending',
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;

    const loader = this.searchQuery.trim()
      ? this.adminService.searchBookings(this.searchQuery, this.currentPage, this.pageSize)
      : this.adminService.getAllBookings(
          this.currentPage,
          this.pageSize,
          this.sortBy,
          this.sortOrder
        );

    loader.subscribe(
      (response: any) => {
        const rows = Array.isArray(response?.data) ? response.data : [];
        this.bookings = rows
          .filter((row: any) => row && (row.id || row._id))
          .map((row: any) => ({
            ...row,
            id: String(row.id || row._id),
            bookingId: row.bookingId || String(row.id || row._id).slice(0, 10),
            userName: row.userName || row.username || '-',
            flightNumber: row.flightNumber || row.flightId || '-',
            paymentMethod: row.paymentMethod || '',
            paymentStatus: row.paymentStatus || '',
            totalPrice: Number(row.totalPrice || row.totalCost || 0),
            passengers: Number(row.passengers || row.numberOfPassengers || 0),
            numberOfPassengers: Number(row.numberOfPassengers || row.passengers || 0),
            status: this.normalizeStatus(row.status),
            createdAt: row.createdAt || row.updatedAt || new Date().toISOString(),
          }));
        this.totalRecords = response.total || 0;
        this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading bookings:', error);
        this.isLoading = false;
      }
    );
  }

  searchBookings(): void {
    this.currentPage = 1;
    this.loadBookings();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadBookings();
  }

  setSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.loadBookings();
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'fa-sort';
    return this.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedBooking = null;
    this.formData = {
      userIdentifier: '',
      flightIdentifier: '',
      classType: 'economy',
      status: 'pending',
      totalPrice: 0,
      numberOfPassengers: 1,
      paymentMethod: '',
      paymentStatus: 'pending',
    };
    this.showModal = true;
  }

  openEditModal(booking: any): void {
    this.isEditMode = true;
    this.selectedBooking = booking;
    this.formData = {
      userIdentifier: booking.userName || booking.username || booking.userId || '',
      flightIdentifier: booking.flightNumber || booking.flightId || '',
      classType: booking.classType || 'economy',
      status: this.normalizeStatus(booking.status),
      totalPrice: Number(booking.totalPrice || booking.totalCost || 0),
      numberOfPassengers: Number(booking.numberOfPassengers || booking.passengers || 1),
      paymentMethod: booking.paymentMethod || '',
      paymentStatus: booking.paymentStatus || 'pending',
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveBooking(): void {
    if (this.isEditMode) {
      this.updateBooking();
    } else {
      this.createBooking();
    }
  }

  createBooking(): void {
    this.adminService.createBooking(this.formData).subscribe(
      () => {
        this.loadBookings();
        this.closeModal();
      },
      (error) => {
        console.error('Error creating booking:', error);
      }
    );
  }

  updateBooking(): void {
    if (!this.selectedBooking) return;
    const payload = {
      status: this.formData.status,
      totalPrice: Number(this.formData.totalPrice || 0),
      numberOfPassengers: Number(this.formData.numberOfPassengers || 1),
    };

    this.adminService.updateBooking(this.getBookingId(this.selectedBooking), payload).subscribe(
      () => {
        this.loadBookings();
        this.closeModal();
      },
      (error) => {
        console.error('Error updating booking:', error);
      }
    );
  }

updateBookingStatus(booking: any, status: 'confirmed' | 'cancelled'): void {
  const bookingId = this.getBookingId(booking);

  if (!bookingId) {
    console.error('Booking ID not found');
    return;
  }

  console.log('Updating Status:', bookingId, status); // 🔍 debug

  this.adminService.updateBooking(bookingId, { status }).subscribe(
    () => {
      console.log('Status updated successfully');

      // ✅ Update UI instantly (no reload delay)
      booking.status = status;

      // Optional reload (keep if needed)
      this.loadBookings();
    },
    (error) => {
      console.error('Error updating booking status:', error);
    }
  );
}
  deleteBooking(id: string): void {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    this.adminService.deleteBooking(id).subscribe(
      () => this.loadBookings(),
      (error) => {
        console.error('Error deleting booking:', error);
      }
    );
  }

  getStatusBadgeClass(status: string): string {
    const value = this.normalizeStatus(status);
    if (value === 'confirmed') return 'badge-success';
    if (value === 'pending') return 'badge-warning';
    if (value === 'cancelled') return 'badge-danger';

    return 'badge-secondary';
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadBookings();
  }

  goToFirstPage(): void {
    if (this.currentPage === 1) return;
    this.currentPage = 1;
    this.loadBookings();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.loadBookings();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      this.loadBookings();
    }
  }

  goToLastPage(): void {
    if (this.currentPage === this.totalPages) return;
    this.currentPage = this.totalPages;
    this.loadBookings();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBookings();
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

  getBookingId(booking: any): string {
    return String(booking?.id || booking?._id || '');
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
    if (value === 'canceled') return 'cancelled';
    return value || 'pending';
  }
}

