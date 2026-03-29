import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/User/user.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  sidebarOpen = true;
  currentPage = 'flights';
  loggedInDisplayName = 'Admin';
  adminDropdownOpen = false;

  constructor(private router: Router, private userService: UserService) {}

  toggleAdminDropdown(): void {
    this.adminDropdownOpen = !this.adminDropdownOpen;
  }

  closeAdminDropdown(): void {
    this.adminDropdownOpen = false;
  }

  ngOnInit(): void {
    this.loggedInDisplayName =
      localStorage.getItem('name') || localStorage.getItem('username') || 'Admin';

    this.userService.getLoginUserData().subscribe({
      next: (response: any) => {
        const user = response?.user || response?.data?.[0];
        if (!user) {
          return;
        }

        const displayName = user.name || user.username || this.loggedInDisplayName;
        this.loggedInDisplayName = displayName;

        if (user.name) localStorage.setItem('name', user.name);
        if (user.username) localStorage.setItem('username', user.username);
        if (user.email) localStorage.setItem('email', user.email);
        if (user.role) localStorage.setItem('role', user.role);
        if (user.id || user._id) localStorage.setItem('id', user.id || user._id);
      },
      error: () => {
        // Keep localStorage fallback if profile API fails.
      },
    });

    this.loadAdminDashboard();
  }

  loadAdminDashboard(): void {
    // Load initial dashboard data
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  selectPage(page: string): void {
    this.currentPage = page;
  }

  navigateTo(path: string): void {
    this.router.navigate([`/admin/${path}`]);
  }

  logoutAdmin(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('id');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    this.router.navigate(['/login-page']);
  }
}
