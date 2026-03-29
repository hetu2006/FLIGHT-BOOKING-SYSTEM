import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CITIES } from '../../../../constants/IMPData';

@Component({
  selector: 'app-admin-flights',
  templateUrl: './admin-flights.component.html',
  styleUrls: ['./admin-flights.component.css'],
})
export class AdminFlightsComponent implements OnInit {
  flights: any[] = [];
  cities = CITIES;
  isLoading = false;
  showAddModal = false;
  showEditModal = false;
  addForm: any = {
    routeSource: '',
    routeDestination: '',
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: '06:00',
    flightNumber: '',
    airline: '',
    economyClassTicketCost: 5000,
    businessClassTicketCost: 10000,
    firstClassTicketCost: 15000,
    economyClassTotalSeats: 100,
    businessClassTotalSeats: 20,
    firstClassTotalSeats: 10,
    isEconomyClass: true,
    isBusinessClass: true,
    isFirstClass: true,
  };
  editForm: any = {
    routeSource: '',
    routeDestination: '',
    departureDate: '',
    departureTime: '',
    flightNumber: '',
    airline: '',
    economyClassTicketCost: 0,
    businessClassTicketCost: 0,
    firstClassTicketCost: 0,
    economyClassTotalSeats: 0,
    businessClassTotalSeats: 0,
    firstClassTotalSeats: 0,
    isEconomyClass: true,
    isBusinessClass: true,
    isFirstClass: true,
  };
  editingFlightId: string = '';

  constructor(private adminService: AdminService) {}

  openAddModal(): void {
    this.addForm = {
      routeSource: '',
      routeDestination: '',
      departureDate: new Date().toISOString().split('T')[0],
      departureTime: '06:00',
      flightNumber: '',
      airline: '',
      economyClassTicketCost: 5000,
      businessClassTicketCost: 10000,
      firstClassTicketCost: 15000,
      economyClassTotalSeats: 100,
      businessClassTotalSeats: 20,
      firstClassTotalSeats: 10,
      isEconomyClass: true,
      isBusinessClass: true,
      isFirstClass: true,
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openEditModal(flight: any): void {
    this.editingFlightId = flight._id || flight.id;
    this.editForm = {
      routeSource: flight.source || flight.routeSource,
      routeDestination: flight.destination || flight.routeDestination,
      departureDate: flight.departureDate,
      departureTime: flight.departureTime,
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      economyClassTicketCost: flight.economyClassTicketCost || flight.price,
      businessClassTicketCost: flight.businessClassTicketCost || 0,
      firstClassTicketCost: flight.firstClassTicketCost || 0,
      economyClassTotalSeats: flight.economyClassTotalSeats || flight.availableSeats,
      businessClassTotalSeats: flight.businessClassTotalSeats || 0,
      firstClassTotalSeats: flight.firstClassTotalSeats || 0,
      isEconomyClass: flight.isEconomyClass !== false,
      isBusinessClass: flight.isBusinessClass !== false,
      isFirstClass: flight.isFirstClass !== false,
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingFlightId = '';
  }

  saveNewFlight(): void {
    if (!this.addForm.routeSource || !this.addForm.routeDestination) {
      alert('Source and Destination are required');
      return;
    }
    this.adminService.createFlight(this.addForm).subscribe(
      () => {
        this.closeAddModal();
        this.loadFlights();
      },
      (err) => console.error('Add flight error:', err)
    );
  }

  saveEditFlight(): void {
    if (!this.editForm.routeSource || !this.editForm.routeDestination) {
      alert('Source and Destination are required');
      return;
    }
    this.adminService.updateFlight(this.editingFlightId, this.editForm).subscribe(
      () => {
        this.closeEditModal();
        this.loadFlights();
      },
      (err) => console.error('Edit flight error:', err)
    );
  }

  ngOnInit(): void {
    this.loadFlights();
  }

  loadFlights(): void {
    this.isLoading = true;
    this.adminService.getAllFlights().subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res?.success) {
          this.flights = res.data || [];
        } else {
          console.error('Failed to load flights:', res);
        }
      },
      (err) => {
        this.isLoading = false;
        console.error('API error:', err);
      }
    );
  }

  deleteFlight(id: string): void {
    if (!confirm('Are you sure you want to delete this flight?')) return;
    this.adminService.deleteFlight(id).subscribe(
      () => this.loadFlights(),
      (err) => console.error('Delete error:', err)
    );
  }

  editFlight(flight: any): void {
    this.openEditModal(flight);
  }
}

