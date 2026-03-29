import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { AdminService } from '../../services/admin.service';

type SortOrder = 'asc' | 'desc';

interface AirlineRow {
  airline: string;
  totalFlights: number;
  routes: string;
  flightIds: string[];
}

@Component({
  selector: 'app-admin-airlines',
  templateUrl: './admin-airlines.component.html',
  styleUrls: ['./admin-airlines.component.css'],
})
export class AdminAirlinesComponent implements OnInit {
  readonly Math = Math;
  rows: AirlineRow[] = [];
  pagedRows: AirlineRow[] = [];
  searchQuery = '';
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50];
  totalPages = 1;
  totalRecords = 0;
  isLoading = false;

  sortBy: keyof AirlineRow = 'airline';
  sortOrder: SortOrder = 'asc';

  showModal = false;
  selectedRow: AirlineRow | null = null;
  newAirlineName = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadAirlines();
  }

  loadAirlines(): void {
    this.isLoading = true;
    this.adminService.getAllFlights(1, 500, 'airline', 'asc').subscribe(
      (response: any) => {
        const flights = response.data || [];
        const map = new Map<string, AirlineRow>();

        flights.forEach((flight: any) => {
          const airline = String(flight.airline || 'Unknown').trim() || 'Unknown';
          const route = `${flight.source || flight.routeSource || '-'} -> ${
            flight.destination || flight.routeDestination || '-'
          }`;

          if (!map.has(airline)) {
            map.set(airline, {
              airline,
              totalFlights: 0,
              routes: '',
              flightIds: [],
            });
          }

          const row = map.get(airline)!;
          row.totalFlights += 1;
          row.flightIds.push(flight.id);

          const routeSet = new Set(
            row.routes
              .split(', ')
              .map((x) => x.trim())
              .filter(Boolean)
          );
          routeSet.add(route);
          row.routes = Array.from(routeSet).slice(0, 3).join(', ');
        });

        this.rows = Array.from(map.values());
        this.applyFilters();
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();
    let filtered = [...this.rows];
    if (query) {
      filtered = filtered.filter(
        (r) => r.airline.toLowerCase().includes(query) || r.routes.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      const dir = this.sortOrder === 'asc' ? 1 : -1;
      const av = a[this.sortBy];
      const bv = b[this.sortBy];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });

    this.totalRecords = filtered.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedRows = filtered.slice(start, start + this.pageSize);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  setSort(field: keyof AirlineRow): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: keyof AirlineRow): string {
    if (this.sortBy !== field) return 'fa-sort';
    return this.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  openEditModal(row: AirlineRow): void {
    this.selectedRow = row;
    this.newAirlineName = row.airline;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRow = null;
  }

  saveAirline(): void {
    if (!this.selectedRow) return;
    const updated = this.newAirlineName.trim();
    if (!updated) return;

    const requests = this.selectedRow.flightIds.map((id) =>
      this.adminService.updateFlight(id, { airline: updated })
    );
    (requests.length ? forkJoin(requests) : of([])).subscribe(() => {
      this.closeModal();
      this.loadAirlines();
    });
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  goToFirstPage(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage -= 1;
    this.applyFilters();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage += 1;
    this.applyFilters();
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
    this.applyFilters();
  }

  goToPage(page: number | string): void {
    if (typeof page !== 'number' || page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilters();
  }

  getPaginationPages(): Array<number | string> {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 10) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: Array<number | string> = [1];
    if (current > 4) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let p = start; p <= end; p += 1) pages.push(p);
    if (current < total - 3) pages.push('...');
    pages.push(total);
    return pages;
  }
}

