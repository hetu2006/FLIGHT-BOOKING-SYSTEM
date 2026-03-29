import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminFlightsComponent } from './pages/admin-flights/admin-flights.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { AdminBookingsComponent } from './pages/admin-bookings/admin-bookings.component';
import { AdminIssuesComponent } from './pages/admin-issues/admin-issues.component';
import { AdminContactsComponent } from './pages/admin-contacts/admin-contacts.component';
import { AdminRegistrationsComponent } from './pages/admin-registrations/admin-registrations.component';
import { AdminAirlinesComponent } from './pages/admin-airlines/admin-airlines.component';
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { AdminEditProfileComponent } from './pages/admin-edit-profile/admin-edit-profile.component';
import { AdminPaymentsComponent } from './pages/admin-payments/admin-payments.component';
import { AdminReportComponent } from './pages/admin-report/admin-report.component';
import { AdminService } from './services/admin.service';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminEditProfileComponent,
    AdminPaymentsComponent,
    AdminReportComponent,
    AdminFlightsComponent,
    AdminUsersComponent,
    AdminBookingsComponent,
    AdminIssuesComponent,
    AdminContactsComponent,
    AdminRegistrationsComponent,
    AdminAirlinesComponent,
    AdminHomeComponent,
  ],
  imports: [CommonModule, FormsModule, AdminRoutingModule],
  providers: [AdminService],
})
export class AdminModule {}
