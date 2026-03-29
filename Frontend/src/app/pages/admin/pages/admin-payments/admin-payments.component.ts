import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-payments',
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.css'],
})
export class AdminPaymentsComponent implements OnInit {
  payments: any[] = [];
  isLoading = false;
  showModal = false;
  isEditMode = false;
  formData: any = {
    userId: '',
    bookingId: '',
    flightId: '',
    amount: 0,
    currency: 'INR',
    paymentMethod: '',
    transactionId: '',
    status: 'pending',
    paymentGateway: 'razorpay',
    notes: '',
  };
  selectedPayment: any = null;

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.adminService.getAllPayments(1, 100).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.success) {
          this.payments = res.data || [];
        } else {
          console.error('Failed to load payments:', res);
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedPayment = null;
    this.formData = {
      userId: '',
      bookingId: '',
      flightId: '',
      amount: 0,
      currency: 'INR',
      paymentMethod: 'upi',
      transactionId: 'TXN' + Date.now(),
      status: 'pending',
      paymentGateway: 'razorpay',
      notes: '',
    };
    this.showModal = true;
  }

  openEditModal(p: any): void {
    this.isEditMode = true;
    this.selectedPayment = p;
    this.formData = {
      userId: p.userId || '',
      bookingId: p.bookingId || '',
      flightId: p.flightId || '',
      amount: p.amount || 0,
      currency: p.currency || 'INR',
      paymentMethod: p.paymentMethod || 'upi',
      transactionId: p.transactionId || '',
      status: p.status || 'pending',
      paymentGateway: p.paymentGateway || 'razorpay',
      notes: p.notes || '',
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  savePayment(): void {
    if (this.isEditMode && this.selectedPayment) {
      this.adminService
        .updatePayment(this.selectedPayment.id || this.selectedPayment._id, this.formData)
        .subscribe({
          next: () => {
            this.toastr.success('Payment updated');
            this.closeModal();
            this.loadPayments();
          },
        });
    } else {
      this.toastr.info('Payment creation should be done through booking process');
      this.closeModal();
    }
  }

  deletePayment(p: any): void {
    if (!confirm('Delete this payment record?')) return;
    this.adminService.deletePayment(p.id || p._id).subscribe({
      next: () => {
        this.toastr.success('Deleted');
        this.loadPayments();
      },
    });
  }
}
