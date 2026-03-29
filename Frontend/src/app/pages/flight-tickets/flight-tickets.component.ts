import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FlightService } from 'src/app/services/Flight/flight.service';
import { UserService } from 'src/app/services/User/user.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-flight-tickets',
  templateUrl: './flight-tickets.component.html',
  styleUrls: ['./flight-tickets.component.css'],
})
export class FlightTicketsComponent implements OnInit {
  selectedFlight: any[];
  displayEconomyClass = false;
  displayBusinessClass = false;
  displayFirstClass = false;
  displayFinalCosting = false;

  finalBookingObject: any = {};

  isEconomyClass = false;
  isBusinessClass = false;
  isFirstClass = false;

  economyClassTickets = '';
  economyClassTicketPrice = '';

  businessClassTickets = '';
  businessClassTicketPrice = '';

  firstClassTickets = '';
  firstClassTicketPrice = '';

  finalTotalPrice = 0;
  finalTotalTickets = 0;

  displayModal = false;
  showPaymentModal = false;
  paymentMethod: string = '';
  paymentDetails: any = { upiId: '', cardNumber: '', expiry: '', cvv: '' };
  paymentErrors: string[] = [];
  isPaymentProcessing = false;
  passengerDetails: Array<{ name: string }> = [];
  userDetails: any = { name: '', username: '', email: '', phoneNo: '' };

  constructor(
    private flightService: FlightService,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.selectedFlight = [];
  }

  ngOnInit(): void {
    this.flightService.getSelectedFlight().subscribe((selectedFlightsData) => {
      this.selectedFlight = selectedFlightsData;

      this.economyClassTicketPrice =
        selectedFlightsData[0].economyClassTicketCost;
      this.businessClassTicketPrice =
        selectedFlightsData[0].businessClassTicketCost;
      this.firstClassTicketPrice = selectedFlightsData[0].firstClassTicketCost;

      this.displayEconomyClass = selectedFlightsData[0].isEconomyClass;
      this.displayBusinessClass = selectedFlightsData[0].isBusinessClass;
      this.displayFirstClass = selectedFlightsData[0].isFirstClass;
    });

    if (this.selectedFlight.length === 0) {
      this.router.navigate(['/flight-booking']);
    }
  }

  handleSetFormSubmit(event: Event) {
    event.preventDefault();

    if (!this.isEconomyClass && !this.isBusinessClass && !this.isFirstClass) {
      this.toastr.warning(
        'You have to select atleast one class before booking flight'
      );
      return console.log(
        'You have to select atleast one class before booking flight'
      );
    }
    this.finalTotalTickets = 0;
    this.finalTotalPrice = 0;
    this.finalBookingObject = {};

    // reset previous passenger list
    this.passengerDetails = [];

    if (this.isEconomyClass) {
      if (this.economyClassTickets === '') {
        this.toastr.warning('Please enter economy class details');
        return console.log('Please enter economy class details');
      }
      this.finalBookingObject['isEconomyClass'] = true;
      this.finalBookingObject['economyClassTickets'] = parseInt(
        this.economyClassTickets
      );
      this.finalBookingObject['economyClassTicketCost'] =
        parseInt(this.economyClassTickets) *
        parseInt(this.economyClassTicketPrice);

      this.finalTotalTickets += parseInt(this.economyClassTickets);
      this.finalTotalPrice +=
        parseInt(this.economyClassTickets) *
        parseInt(this.economyClassTicketPrice);
    } else {
      this.finalBookingObject['isEconomyClass'] = false;
    }

    if (this.isBusinessClass) {
      if (this.businessClassTickets === '') {
        this.toastr.warning('Please enter business class details');
        return console.log('Please enter business class details');
      }
      this.finalBookingObject['isBusinessClass'] = true;
      this.finalBookingObject['businessClassTickets'] = parseInt(
        this.businessClassTickets
      );
      this.finalBookingObject['businessClassTicketCost'] =
        parseInt(this.businessClassTickets) *
        parseInt(this.businessClassTicketPrice);

      this.finalTotalTickets += parseInt(this.businessClassTickets);
      this.finalTotalPrice +=
        parseInt(this.businessClassTicketPrice) *
        parseInt(this.businessClassTickets);
    } else {
      this.finalBookingObject['isBusinessClass'] = false;
    }

    if (this.isFirstClass) {
      if (this.firstClassTickets === '') {
        this.toastr.warning('Please enter first class details');
        return console.log('Please enter first class details');
      }

      this.finalBookingObject['isFirstClass'] = true;
      this.finalBookingObject['firstClassTickets'] = parseInt(
        this.firstClassTickets
      );
      this.finalBookingObject['firstClassTicketCost'] =
        parseInt(this.firstClassTickets) * parseInt(this.firstClassTicketPrice);

      this.finalTotalTickets += parseInt(this.firstClassTickets);
      this.finalTotalPrice +=
        parseInt(this.firstClassTicketPrice) * parseInt(this.firstClassTickets);
    } else {
      this.finalBookingObject['isFirstClass'] = false;
    }

    this.displayFinalCosting = true;

    // build empty passenger detail entries for each ticket
    for (let i = 0; i < this.finalTotalTickets; i++) {
      this.passengerDetails.push({ name: '' });
    }
  }

  openPaymentModal() {
    this.userService.getCurrentUserData().subscribe(
      (res: any) => {
        const u = res?.user || res?.data?.[0] || {};
        this.userDetails = {
          name: u.name || localStorage.getItem('name'),
          username: u.username || localStorage.getItem('username'),
          email: u.email || localStorage.getItem('email'),
          phoneNo: u.phoneNo || '',
        };
      },
      () => {
        this.userDetails = {
          name: localStorage.getItem('name'),
          username: localStorage.getItem('username'),
          email: localStorage.getItem('email'),
          phoneNo: '',
        };
      }
    );

    this.paymentMethod = '';
    this.paymentDetails = { upiId: '', cardNumber: '', expiry: '', cvv: '' };
    this.paymentErrors = [];
    this.isPaymentProcessing = false;

    document.body.style.overflow = 'hidden';
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    document.body.style.overflow = '';
    this.paymentErrors = [];
    this.isPaymentProcessing = false;
  }

  validatePayment(): boolean {
    this.paymentErrors = [];

    if (!this.paymentMethod) {
      this.paymentErrors.push('Please select a payment method.');
    }

    const upi = (this.paymentDetails.upiId || '').trim();
    const cardNum = (this.paymentDetails.cardNumber || '').replace(/\s+/g, '');

    if (this.paymentMethod && this.paymentMethod !== 'card') {
      if (!upi) {
        this.paymentErrors.push('UPI ID / mobile is required.');
      } else {
        const isUpi = /^[\w.-]+@[\w.-]+$/.test(upi);
        const isMobile = /^[6-9]\d{9}$/.test(upi);
        if (!isUpi && !isMobile) {
          this.paymentErrors.push('Enter a valid UPI ID or mobile number.');
        }
      }
    }

    if (this.paymentMethod === 'card') {
      const expiry = (this.paymentDetails.expiry || '').trim();
      const cvv = (this.paymentDetails.cvv || '').trim();

      if (!/^[0-9]{16}$/.test(cardNum)) {
        this.paymentErrors.push('Card number must be 16 digits.');
      }
      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry)) {
        this.paymentErrors.push('Expiry must be in MM/YY format.');
      }
      if (!/^[0-9]{3,4}$/.test(cvv)) {
        this.paymentErrors.push('CVV must be 3 or 4 digits.');
      }
    }

    return this.paymentErrors.length === 0;
  }

  submitPayment(event: Event) {
    event.preventDefault();

    if (!this.validatePayment()) {
      this.toastr.error(this.paymentErrors.join(' '));
      return;
    }

    this.isPaymentProcessing = true;
    this.bookFlight();
  }

  bookFlight() {
    this.finalBookingObject['flightId'] = this.selectedFlight[0]._id;
    this.finalBookingObject['totalCost'] = this.finalTotalPrice;
    // include passenger details from form
    if (this.passengerDetails.length) {
      this.finalBookingObject['passengerDetails'] = this.passengerDetails;
    }

    // console.log('Final Book Flight: ', this.finalBookingObject);

    // normal booking (without payment) is still supported
    this.displayModal = true;
    if (!this.paymentMethod) {
      // fallback to existing path
      this.flightService.bookNewFlight(this.finalBookingObject).subscribe(
        (result: any) => {
          console.log(result);
          if (result.isDone) {
            console.log('Flight Booked Successfully');

            this.toastr.success('Flight Booked Successfully');
            this.displayModal = false;
            this.router.navigate(['/flight-receipt']);
            this.flightService.bookedFlight.splice(0, 1);
            const resultBooking = Array.isArray(result.data) ? result.data[0] : result.data;
            this.flightService.bookedFlight.push(resultBooking);
          } else {
            console.log('Error', result.err);
            this.toastr.error('Error', result.err);
            this.displayModal = false;
          }
        },
        (error) => {
          console.log('Error Occured: ', error.message);
          this.toastr.error('Error', error.message);
          this.displayModal = false;
        }
      );
    } else {
      const backendMethod = ['googlepay','paytm','bhim','phonepe'].includes(this.paymentMethod) ? 'upi' : (this.paymentMethod === 'card' ? 'credit' : 'upi');
      const paymentPayload = {
        data: this.finalBookingObject,
        payment: {
          method: backendMethod,
          details: this.paymentDetails,
        },
      };
      this.flightService.processPayment(paymentPayload).subscribe(
        (result: any) => {
          this.displayModal = false;
          this.showPaymentModal = false;
          if (result.isDone) {
            Swal.fire({
              icon: 'success',
              title: 'Payment Successful!',
              text: 'Your booking is confirmed. Downloading your slip...',
              timer: 2000,
              showConfirmButton: false,
            }).then(() => {
              this.flightService.bookedFlight = [];
              const bData = Array.isArray(result.data) ? result.data[0] : result.data;
              this.flightService.bookedFlight.push(bData);
              this.router.navigate(['/flight-receipt']);
            });
          } else {
            this.isPaymentProcessing = false;
            this.showPaymentModal = true;
            Swal.fire({
              icon: 'error',
              title: 'Payment Failed',
              text: result.err || result.msg || 'Please try again or use another payment method.',
              confirmButtonText: 'OK',
            });
          }
        },
        (error) => {
          this.isPaymentProcessing = false;
          this.displayModal = false;
          this.showPaymentModal = true;
          Swal.fire({
            icon: 'error',
            title: 'Payment Failed',
            text: error?.error?.msg || error?.message || 'Transaction failed. Please try again.',
            confirmButtonText: 'OK',
          });
        }
      );
    }
  }
}
