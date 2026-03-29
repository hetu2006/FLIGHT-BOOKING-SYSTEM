import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_PATH, TOKEN_PREFIX } from 'src/app/constants/IMPData';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  private getHeaders(): any {
    const jwt_token = localStorage.getItem('token');
    return {
      authorization: `${TOKEN_PREFIX} ${jwt_token}`,
    };
  }

  // Flight Management
  getAllFlights(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Observable<any> {
    return this.http.post(
      `${API_PATH}/admin/flights/list`,
      { page, limit, sortBy, sortOrder },
      { headers: this.getHeaders() }
    );
  }

  getFlightById(id: string): Observable<any> {
    return this.http.get(`${API_PATH}/admin/flights/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createFlight(flightData: any): Observable<any> {
    return this.http.post(`${API_PATH}/admin/flights/create`, flightData, {
      headers: this.getHeaders(),
    });
  }

  updateFlight(id: string, flightData: any): Observable<any> {
    return this.http.put(
      `${API_PATH}/admin/flights/${id}`,
      flightData,
      { headers: this.getHeaders() }
    );
  }

  deleteFlight(id: string): Observable<any> {
    return this.http.delete(`${API_PATH}/admin/flights/${id}`, {
      headers: this.getHeaders(),
    });
  }

  searchFlights(query: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.post(
      `${API_PATH}/admin/flights/search`,
      { query, page, limit },
      { headers: this.getHeaders() }
    );
  }

  // User Management
  getAllUsers(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Observable<any> {
    return this.http.post(
      `${API_PATH}/admin/users/list`,
      { page, limit, sortBy, sortOrder },
      { headers: this.getHeaders() }
    );
  }

  getRegistrationList(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Observable<any> {
    return this.http.post(
      `${API_PATH}/admin/registrations/list`,
      { page, limit, sortBy, sortOrder },
      { headers: this.getHeaders() }
    );
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${API_PATH}/admin/users/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${API_PATH}/admin/users/create`, userData, {
      headers: this.getHeaders(),
    });
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put(`${API_PATH}/admin/users/${id}`, userData, {
      headers: this.getHeaders(),
    });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${API_PATH}/admin/users/${id}`, {
      headers: this.getHeaders(),
    });
  }

  searchUsers(query: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.post(
      `${API_PATH}/admin/users/search`,
      { query, page, limit },
      { headers: this.getHeaders() }
    );
  }

  // Booking Management
  getAllBookings(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Observable<any> {
    return this.http.post(
      `${API_PATH}/admin/bookings/list`,
      { page, limit, sortBy, sortOrder },
      { headers: this.getHeaders() }
    );
  }

  getBookingById(id: string): Observable<any> {
    return this.http.get(`${API_PATH}/admin/bookings/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createBooking(bookingData: any): Observable<any> {
    return this.http.post(`${API_PATH}/admin/bookings/create`, bookingData, {
      headers: this.getHeaders(),
    });
  }

  updateBooking(id: string, bookingData: any): Observable<any> {
    return this.http.put(
      `${API_PATH}/admin/bookings/${id}`,
      bookingData,
      { headers: this.getHeaders() }
    );
  }

  deleteBooking(id: string): Observable<any> {
    return this.http.delete(`${API_PATH}/admin/bookings/${id}`, {
      headers: this.getHeaders(),
    });
  }

  searchBookings(query: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.post(
      `${API_PATH}/admin/bookings/search`,
      { query, page, limit },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Retrieve aggregated statistics for dashboard (bookings count, revenue, etc.)
   */
  getStats(): Observable<any> {
    return this.http.get(`${API_PATH}/admin/stats`, { headers: this.getHeaders() });
  }

  getReport(filter: 'day' | 'month' | 'year'): Observable<any> {
    return this.http.get(`${API_PATH}/admin/report?filter=${filter}`, { headers: this.getHeaders() });
  }

  // Issue Management
  getAllIssues(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Observable<any> {
    return this.http.post(
      `${API_PATH}/admin/issues/list`,
      { page, limit, sortBy, sortOrder },
      { headers: this.getHeaders() }
    );
  }

  getIssueById(id: string): Observable<any> {
    return this.http.get(`${API_PATH}/admin/issues/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createIssue(issueData: any): Observable<any> {
    return this.http.post(`${API_PATH}/admin/issues/create`, issueData, {
      headers: this.getHeaders(),
    });
  }

  updateIssue(id: string, issueData: any): Observable<any> {
    return this.http.put(
      `${API_PATH}/admin/issues/${id}`,
      issueData,
      { headers: this.getHeaders() }
    );
  }

  deleteIssue(id: string): Observable<any> {
    return this.http.delete(`${API_PATH}/admin/issues/${id}`, {
      headers: this.getHeaders(),
    });
  }

  searchIssues(query: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.post(
      `${API_PATH}/admin/issues/search`,
      { query, page, limit },
      { headers: this.getHeaders() }
    );
  }

  // Contact Management
  getAllContacts(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Observable<any> {
    return this.http.post(
      `${API_PATH}/admin/contacts/list`,
      { page, limit, sortBy, sortOrder },
      { headers: this.getHeaders() }
    );
  }

  updateContact(id: string, contactData: any): Observable<any> {
    return this.http.put(`${API_PATH}/admin/contacts/${id}`, contactData, {
      headers: this.getHeaders(),
    });
  }

  deleteContact(id: string): Observable<any> {
    return this.http.delete(`${API_PATH}/admin/contacts/${id}`, {
      headers: this.getHeaders(),
    });
  }

  searchContacts(query: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.post(
      `${API_PATH}/admin/contacts/search`,
      { query, page, limit },
      { headers: this.getHeaders() }
    );
  }

  // Payment Management
  getAllPayments(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Observable<any> {
    return this.http.post(
      `${API_PATH}/admin/payments/list`,
      { page, limit, sortBy, sortOrder },
      { headers: this.getHeaders() }
    );
  }

  getPaymentById(id: string): Observable<any> {
    return this.http.get(`${API_PATH}/admin/payments/${id}`, {
      headers: this.getHeaders(),
    });
  }

  updatePayment(id: string, paymentData: any): Observable<any> {
    return this.http.put(`${API_PATH}/admin/payments/${id}`, paymentData, {
      headers: this.getHeaders(),
    });
  }

  deletePayment(id: string): Observable<any> {
    return this.http.delete(`${API_PATH}/admin/payments/${id}`, {
      headers: this.getHeaders(),
    });
  }

  searchPayments(query: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.post(
      `${API_PATH}/admin/payments/search`,
      { query, page, limit },
      { headers: this.getHeaders() }
    );
  }
}
