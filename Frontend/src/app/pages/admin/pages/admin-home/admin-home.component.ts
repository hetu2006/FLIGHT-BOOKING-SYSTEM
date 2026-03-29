import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'],
})
export class AdminHomeComponent {
  quickLinks: Array<{
    label: string;
    route: string;
    icon: string;
    count?: number;
  }> = [
    { label: 'Manage Airlines', route: '/admin/airlines', icon: 'fa-building' },
    { label: 'Manage Flights', route: '/admin/flights', icon: 'fa-plane' },
    { label: 'Manage Users', route: '/admin/users', icon: 'fa-users' },
    { label: 'Registrations', route: '/admin/registrations', icon: 'fa-user-check' },
    { label: 'Manage Bookings', route: '/admin/bookings', icon: 'fa-ticket' },
    { label: 'Payments', route: '/admin/payments', icon: 'fa-credit-card' },
    { label: 'Report', route: '/admin/report', icon: 'fa-chart-line' },
    { label: 'Manage Issues', route: '/admin/issues', icon: 'fa-circle-exclamation' },
    { label: 'Contact Messages', route: '/admin/contacts', icon: 'fa-envelope' },
  ];

  totalBookings = 0;
  totalRevenue = 0;
  totalFlights = 0;
  totalUsers = 0;
  totalIssues = 0;
  totalContacts = 0;
  totalAirlines = 0;
  recentBookings: any[] = [];
  refreshing = false;
  lastUpdated: Date | null = null;

  stats: Array<{ label: string; value: any; cssClass?: string; icon?: string }> = [];

  constructor(private router: Router, private adminService: AdminService) {}

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.refreshing = true;
    this.adminService.getStats().subscribe(
      (res: any) => {
        this.refreshing = false;
        this.lastUpdated = new Date();
        const data = res?.data || {};
        this.totalBookings = data.totalBookings || 0;
        this.totalRevenue = data.totalRevenue || 0;
        this.totalFlights = data.totalFlights || 0;
        this.totalUsers = data.totalUsers || 0;
        this.totalIssues = data.totalIssues || 0;
        this.totalContacts = data.totalContacts || 0;
        this.totalAirlines = data.totalAirlines || 0;
        this.recentBookings = data.recentBookings || [];

        this.stats = [
          { label: 'Total Bookings', value: this.totalBookings, cssClass: 'bookings', icon: 'fa-ticket' },
          { label: 'Total Revenue', value: `₹${this.totalRevenue}`, cssClass: 'revenue', icon: 'fa-indian-rupee-sign' },
          { label: 'Flights', value: this.totalFlights, cssClass: 'flights', icon: 'fa-plane' },
          { label: 'Users', value: this.totalUsers, cssClass: 'users', icon: 'fa-users' },
          { label: 'Airlines', value: this.totalAirlines, cssClass: 'airlines', icon: 'fa-building' },
          { label: 'Issues', value: this.totalIssues, cssClass: 'issues', icon: 'fa-circle-exclamation' },
          { label: 'Contacts', value: this.totalContacts, cssClass: 'contacts', icon: 'fa-envelope' },
        ];

        this.quickLinks = this.quickLinks.map((link) => {
          let count = 0;
          switch (link.label) {
            case 'Manage Flights': count = this.totalFlights; break;
            case 'Manage Users':
            case 'Registrations': count = this.totalUsers; break;
            case 'Manage Bookings': count = this.totalBookings; break;
            case 'Payments': count = this.totalBookings; break;
            case 'Manage Issues': count = this.totalIssues; break;
            case 'Contact Messages': count = this.totalContacts; break;
            case 'Manage Airlines': count = this.totalAirlines; break;
          }
          return { ...link, count };
        });
      },
      () => { this.refreshing = false; }
    );
  }
}
