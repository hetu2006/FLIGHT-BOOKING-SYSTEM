import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FlightService } from 'src/app/services/Flight/flight.service';

@Component({
  selector: 'app-flight-history',
  templateUrl: './flight-history.component.html',
  styleUrls: ['./flight-history.component.css'],
})
export class FlightHistoryComponent implements OnInit {
  flightHistory: any[] = [];
  filteredHistory: any[] = [];
  searchText = '';

  displayModal = false;

  constructor(
    private router: Router,
    private flightService: FlightService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.displayModal = true;

    this.flightService.getFlightBookingHistory().subscribe(
      (result: any) => {
        if (result && result.isDone) {
          this.toastr.success('History Fetched Successfully');

          this.flightHistory = result.data || [];
          this.filteredHistory = [...this.flightHistory];
          this.flightService.flightHistory = this.flightHistory;
        } else {
          this.toastr.error(
            result?.err?.writeErrors?.[0]?.errmsg || 'Error fetching history'
          );
        }
        this.displayModal = false;
      },
      (error) => {
        this.toastr.error(error?.error?.msg || 'Error occurred');
        this.displayModal = false;
      }
    );
  }

  // 🔍 Search Filter
  filterBookings(): void {
    const q = (this.searchText || '').toLowerCase().trim();

    if (!q) {
      this.filteredHistory = [...this.flightHistory];
      return;
    }

    this.filteredHistory = this.flightHistory.filter((b: any) => {
      const tid =
        b?.tickets && b.tickets[0]?.ticketNo
          ? String(b.tickets[0].ticketNo)
          : '';
      const bid = String(b?.bookingId || b?._id || '');
      const fid = String(b?.flightId || '');

      return (
        tid.toLowerCase().includes(q) ||
        bid.toLowerCase().includes(q) ||
        fid.toLowerCase().includes(q)
      );
    });
  }

  // 🔄 Status Normalize
  normalizeStatus(status: string): string {
    const value = String(status || '').toLowerCase();

    if (value === 'canceled' || value === 'cancelled') return 'cancelled';
    if (value === 'confirmed') return 'confirmed';
    if (value === 'completed') return 'completed';

    return 'pending';
  }

  // ❌ Cancel Booking
  cancelBooking(booking: any): void {
    if (!confirm('Cancel this booking?')) return;

    const bookingId = booking?._id || booking?.id;

    if (!bookingId) {
      this.toastr.error('Booking ID not found');
      return;
    }

    this.flightService
      .updateBookingStatus(bookingId, { status: 'cancelled' })
      .subscribe(
        () => {
          this.toastr.success('Booking cancelled');
          this.ngOnInit();
        },
        (error) => {
          this.toastr.error(
            error?.error?.msg || 'Unable to cancel booking'
          );
        }
      );
  }

  // 👁️ VIEW RECEIPT (Redirect)
  viewReceipt(flightItem: any): void {
    this.flightService.bookedFlight = []; // clear
    this.flightService.bookedFlight.push(flightItem);

    this.router.navigate(['/flight-receipt']);
  }

  // 📥 DOWNLOAD RECEIPT (Redirect + Auto Download)
  downloadReceipt(flightItem: any): void {
    this.flightService.bookedFlight = [];
    this.flightService.bookedFlight.push(flightItem);

    // Navigate to receipt page
    this.router.navigate(['/flight-receipt']);

    // Wait for page to load then download
    setTimeout(() => {
      const element = document.getElementById('receiptContent');

      if (!element) {
        this.toastr.error('Receipt not ready');
        return;
      }

      import('html2canvas').then((html2canvas) => {
        import('jspdf').then((jsPDF) => {
          html2canvas.default(element).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF.default('p', 'mm', 'a4');

            const imgWidth = 208;
            const imgHeight =
              (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('Flight-Receipt.pdf');
          });
        });
      });
    }, 1500);
  }
}