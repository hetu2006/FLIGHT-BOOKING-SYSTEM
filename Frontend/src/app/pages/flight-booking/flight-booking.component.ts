import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FlightService } from 'src/app/services/Flight/flight.service';

@Component({
  selector: 'app-flight-booking',
  templateUrl: './flight-booking.component.html',
  styleUrls: ['./flight-booking.component.css'],
})
export class FlightBookingComponent implements OnInit {
  tripType: 'roundTrip' | 'oneWay' = 'roundTrip';

  origin: string = '';
  destination: string = '';

  departureDate: string = '';
  returnDate: string = '';

  adultCount: number | string = '1';
  childrenCount: number | string = '0';

  flightClass: string = 'Economy Class';

  displayModal = false;
  isFormSubmitted = false;
  today = '';
  quickRoutes = [
    { label: 'Delhi to Mumbai', from: 'Delhi', to: 'Mumbai' },
    { label: 'Bangalore to Delhi', from: 'Bangalore', to: 'Delhi' },
    { label: 'Chennai to Pune', from: 'Chennai', to: 'Pune' },
    { label: 'Jaipur to Mumbai', from: 'Jaipur', to: 'Mumbai' },
  ];

  // City list
  cities = [
    'Mumbai',
    'Pune',
    'Bangalore',
    'Patna',
    'Nagpur',
    'Amritsar',
    'Jaipur',
    'Kota',
    'Delhi',
    'Chennai',
  ];

  constructor(
    private router: Router,
    private flightService: FlightService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.today = new Date().toISOString().split('T')[0];
    this.departureDate = this.today;

    const returnDateObj = new Date();
    returnDateObj.setDate(returnDateObj.getDate() + 7);
    this.returnDate = returnDateObj.toISOString().split('T')[0];
  }

  handleFormSubmit(event: Event) {
    event.preventDefault();
    this.isFormSubmitted = true;

    if (!this.origin) {
      this.toastr.error('Please select origin city');
      return;
    }

    if (!this.destination) {
      this.toastr.error('Please select destination city');
      return;
    }

    if (this.origin === this.destination) {
      this.toastr.error('Origin and destination cannot be the same');
      return;
    }

    if (!this.departureDate) {
      this.toastr.error('Please select departure date');
      return;
    }

    if (this.tripType === 'roundTrip' && !this.returnDate) {
      this.toastr.error('Please select return date');
      return;
    }

    if (this.tripType === 'roundTrip' && this.departureDate >= this.returnDate) {
      this.toastr.error('Return date must be after departure date');
      return;
    }

    const adultsNum = parseInt(String(this.adultCount), 10);
    const childrenNum = parseInt(String(this.childrenCount), 10);
    if (adultsNum === 0 && childrenNum === 0) {
      this.toastr.error('Select at least 1 adult or child');
      return;
    }

    this.displayModal = true;

    // Backend flight schema uses routeSource/routeDestination filters.
    const filterObject = {
      routeSource: this.origin,
      routeDestination: this.destination,
      departureDate: this.departureDate,
    };

    this.flightService.getFlights(filterObject).subscribe(
      (result: any) => {
        if (result?.isError) {
          this.displayModal = false;
          this.toastr.error(result?.message || 'Unable to fetch flights right now');
          return;
        }

        const responseData = result?.data;
        let departureFlights: any[] = [];
        let returnFlights: any[] = [];

        // Support both legacy array response and current structured response.
        if (Array.isArray(responseData)) {
          departureFlights = responseData;
        } else if (responseData && typeof responseData === 'object') {
          if (
            Array.isArray(responseData.departureDateFlights) &&
            responseData.departureDateFlights.length
          ) {
            departureFlights = responseData.departureDateFlights;
          } else if (Array.isArray(responseData.allFlights)) {
            departureFlights = responseData.allFlights;
          }

          if (Array.isArray(responseData.afterDepartureDateFlights)) {
            returnFlights = responseData.afterDepartureDateFlights;
          }
        }

        this.flightService.flights = this.normalizeFlightsForDisplay(departureFlights);
        this.flightService.nextFlights = this.normalizeFlightsForDisplay(returnFlights);
        this.displayModal = false;

        if (this.flightService.flights.length || this.flightService.nextFlights.length) {
          this.toastr.success(`${departureFlights.length + returnFlights.length} flights found`);
          this.router.navigate(['/flights']);
          return;
        }

        this.toastr.info('No flights found for selected dates');
      },
      (error) => {
        console.error('API Error:', error);
        this.displayModal = false;
        if (error?.status === 401 || error?.status === 403) {
          this.toastr.error('Session expired. Please login again.');
          this.router.navigate(['/login-page']);
          return;
        }
        this.toastr.error('Failed to fetch flights. Please try again.');
      }
    );
  }

  getMinReturnDate(): string {
    return this.departureDate || this.today;
  }

  onTripTypeChange(type: 'roundTrip' | 'oneWay'): void {
    this.tripType = type;
  }

  swapCities(): void {
    const previousOrigin = this.origin;
    this.origin = this.destination;
    this.destination = previousOrigin;
  }

  useQuickRoute(from: string, to: string): void {
    this.origin = from;
    this.destination = to;
  }

  private normalizeFlightsForDisplay(flights: any[]): any[] {
    return (Array.isArray(flights) ? flights : []).map((flight: any) => ({
      ...flight,
      id: flight.id || flight._id,
      name:
        flight.name ||
        [flight.airline, flight.flightNumber].filter(Boolean).join(' ') ||
        `${flight.routeSource || flight.source || 'City'} - ${
          flight.routeDestination || flight.destination || 'City'
        }`,
      routeSource: flight.routeSource || flight.source || '',
      routeDestination: flight.routeDestination || flight.destination || '',
      departureDate: flight.departureDate || flight.date || '',
      departureTime: flight.departureTime || '',
      flightDuration: flight.flightDuration || flight.duration || '',
    }));
  }
}
