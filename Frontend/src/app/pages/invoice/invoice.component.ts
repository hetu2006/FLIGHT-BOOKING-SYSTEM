import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FlightService } from 'src/app/services/Flight/flight.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
})
export class InvoiceComponent implements OnInit {
  bookingData: any[] = [];
  slipDownloaded = false;

  constructor(
    private toastr: ToastrService,
    private flightService: FlightService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.flightService.getBookedFlightData().subscribe((newData) => {
      let data: any = null;
      if (Array.isArray(newData)) {
        data = newData[0] || null;
      } else if (newData) {
        data = newData;
      }
      this.bookingData = data ? [data] : [];
      if (!this.bookingData.length) {
        this.router.navigate(['/flight-booking']);
      }
    });
  }

  get booking() {
    return this.bookingData[0] || null;
  }

  downloadSlipPdf(): void {
    if (!this.bookingData?.[0]) {
      this.toastr.error('No booking data available to download');
      return;
    }

    const b = this.bookingData[0];
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('Flight Booking Receipt', 105, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Booking ID: ${b.bookingId || b._id || '-'}`, 14, 34);
    doc.text(`Passenger: ${b.username || b.user?.name || '-'}`, 14, 42);
    doc.text(`Email: ${b.user?.email || '-'}`, 14, 50);
    doc.text(`Phone: ${b.user?.phoneNo || '-'}`, 14, 58);
    doc.text(`Total Cost: Rs. ${b.totalCost || b.totalPrice || 0}`, 14, 66);

    const tickets = b.tickets || [];
    const startY = 82;
    doc.setFontSize(12);
    doc.text('Ticket Details', 14, startY);
    doc.setFontSize(10);
    doc.text('Passenger', 14, startY + 8);
    doc.text('Class', 72, startY + 8);
    doc.text('Ticket No', 118, startY + 8);

    let currentY = startY + 16;
    for (let i = 0; i < tickets.length; i++) {
      const t = tickets[i] || {};
      doc.text(`Passenger ${i + 1}`, 14, currentY);
      doc.text(`${t.className || '-'}`, 72, currentY);
      doc.text(`${t.ticketNo || '-'}`, 118, currentY);
      currentY += 8;
      if (currentY > 275) {
        doc.addPage();
        currentY = 20;
      }
    }

    const fileName = `Booking_Receipt_${b.bookingId || b._id || Date.now()}.pdf`;
    doc.save(fileName);
    this.toastr.success('PDF downloaded successfully');
  }

  printSlip(): void {
    window.print();
  }
}
