import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: AdminHomeComponent },
      { path: 'edit-profile', component: AdminEditProfileComponent },
      { path: 'payments', component: AdminPaymentsComponent },
      { path: 'report', component: AdminReportComponent },
      { path: 'airlines', component: AdminAirlinesComponent },
      { path: 'flights', component: AdminFlightsComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'registrations', component: AdminRegistrationsComponent },
      { path: 'bookings', component: AdminBookingsComponent },
      { path: 'issues', component: AdminIssuesComponent },
      { path: 'contacts', component: AdminContactsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
