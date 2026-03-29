import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-report',
  templateUrl: './admin-report.component.html',
  styleUrls: ['./admin-report.component.css'],
})
export class AdminReportComponent implements OnInit {
  report: any = null;
  filter: 'day' | 'month' | 'year' = 'month';
  isLoading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.isLoading = true;
    this.adminService.getReport(this.filter).subscribe({
      next: (res: any) => {
        this.report = res?.data || res;
        this.isLoading = false;
      },
      error: () => {
        this.adminService.getStats().subscribe({
          next: (s: any) => {
            this.report = {
              totalBookings: s?.data?.totalBookings || 0,
              totalRevenue: s?.data?.totalRevenue || 0,
              profit: s?.data?.totalRevenue || 0,
              balance: s?.data?.totalRevenue || 0,
            };
            this.isLoading = false;
          },
          error: () => { this.isLoading = false; },
        });
      },
    });
  }

  setFilter(f: 'day' | 'month' | 'year'): void {
    this.filter = f;
    this.loadReport();
  }
}
