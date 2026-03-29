# 🚀 Complete API Requirements - Flight Booking System

**Project:** Online Flight Ticket Booking System  
**Frontend:** HTML, CSS, JavaScript, Bootstrap, AngularJS  
**Backend:** Node.js, MongoDB  
**Status:** Complete API Checklist  
**Date:** March 1, 2026

---

## 📋 Complete API List with Status

### ✅ = Already Implemented in Backend
### ❌ = Missing (Need to Create)
### ⚠️ = Partially Implemented

---

## 🔐 **1. AUTHENTICATION APIs**

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 1.1 | User Signup | POST | `/auth/signup` | ✅ | Signup Page |
| 1.2 | User Login | POST | `/auth/login` | ✅ | Login Page |
| 1.3 | User Logout | POST | `/auth/logout` | ❌ | All Pages |
| 1.4 | Refresh Token | POST | `/auth/refresh-token` | ❌ | Session Management |
| 1.5 | Verify Token | GET | `/auth/verify-token` | ❌ | Guards/Protection |
| 1.6 | Forgot Password | POST | `/auth/forgot-password` | ❌ | Password Reset |
| 1.7 | Reset Password | POST | `/auth/reset-password/:token` | ❌ | Password Reset |

---

## ✈️ **2. FLIGHT MANAGEMENT APIs**

### 2.1 Flight CRUD Operations

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 2.1.1 | Add Flight | POST | `/flight/addFlight` | ✅ | Admin - Add Flight |
| 2.1.2 | Get All Flights | POST | `/flight/getflights` | ✅ | Client - Flights Page |
| 2.1.3 | Get Flight by ID | GET | `/flight/:id` | ❌ | Flight Details |
| 2.1.4 | Update Flight | PUT | `/flight/:id` | ❌ | Admin - Edit Flight |
| 2.1.5 | Delete Flight | DELETE | `/flight/:id` | ❌ | Admin - Delete Flight |
| 2.1.6 | Search Flights | POST | `/flight/search` | ❌ | Search Functionality |
| 2.1.7 | Get Paginated Flights | GET | `/flight/list?page=X&limit=Y` | ❌ | Admin Panel |
| 2.1.8 | Get Flight by Route | POST | `/flight/by-route` | ❌ | Flight Filtering |

### 2.2 Flight Filters & Advanced Search

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 2.2.1 | Filter by Source | POST | `/flight/filter/source` | ❌ | Flights Page |
| 2.2.2 | Filter by Destination | POST | `/flight/filter/destination` | ❌ | Flights Page |
| 2.2.3 | Filter by Date Range | POST | `/flight/filter/date-range` | ❌ | Flights Page |
| 2.2.4 | Filter by Price Range | POST | `/flight/filter/price-range` | ❌ | Flights Page |
| 2.2.5 | Filter by Airline | POST | `/flight/filter/airline` | ❌ | Flights Page |
| 2.2.6 | Multi-Filter Search | POST | `/flight/advanced-search` | ❌ | Flights Page |

---

## 🎫 **3. BOOKING MANAGEMENT APIs**

### 3.1 Booking CRUD Operations

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 3.1.1 | Create Booking | POST | `/flight/booking/newbooking` | ✅ | Booking Process |
| 3.1.2 | Get User Bookings | POST | `/flight/booking/getbookings` | ✅ | My Bookings Page |
| 3.1.3 | Get Booking by ID | GET | `/booking/:id` | ❌ | Booking Details |
| 3.1.4 | Update Booking | PUT | `/booking/:id` | ❌ | Admin - Edit Booking |
| 3.1.5 | Cancel Booking | DELETE | `/booking/:id` | ❌ | Cancel Booking |
| 3.1.6 | Confirm Booking | POST | `/booking/:id/confirm` | ❌ | Booking Confirmation |
| 3.1.7 | Get All Bookings (Admin) | GET | `/bookings/list?page=X` | ❌ | Admin Dashboard |
| 3.1.8 | Search Bookings (Admin) | POST | `/bookings/search` | ❌ | Admin - Search |
| 3.1.9 | Update Booking Status | PUT | `/booking/:id/status` | ❌ | Admin - Status Update |
| 3.1.10 | Get Booking Invoice | GET | `/booking/:id/invoice` | ❌ | Invoice Download |

---

## 👥 **4. USER MANAGEMENT APIs**

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 4.1 | Get Current User | POST | `/user/userdata` | ✅ | Dashboard/Profile |
| 4.2 | Update User Data | POST | `/user/updatedata` | ✅ | Account Settings |
| 4.3 | Change Password | POST | `/user/changepassword` | ✅ | Account Settings |
| 4.4 | Get User by ID | GET | `/user/:id` | ❌ | User Profile |
| 4.5 | Get All Users (Admin) | GET | `/users/list?page=X&limit=Y` | ❌ | Admin - User Management |
| 4.6 | Delete User (Admin) | DELETE | `/user/:id` | ❌ | Admin - Delete User |
| 4.7 | Update User Role (Admin) | PUT | `/user/:id/role` | ❌ | Admin - Role Management |
| 4.8 | Search Users (Admin) | POST | `/users/search` | ❌ | Admin - Search Users |
| 4.9 | Deactivate User | PUT | `/user/:id/deactivate` | ❌ | Account Management |
| 4.10 | Get User Bookings | GET | `/user/:id/bookings` | ❌ | User History |

---

## 🏢 **5. AIRLINE MANAGEMENT APIs**

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 5.1 | Get All Airlines | GET | `/airline/list` | ❌ | Flights Display |
| 5.2 | Add Airline (Admin) | POST | `/airline/add` | ❌ | Admin - Add Airline |
| 5.3 | Update Airline (Admin) | PUT | `/airline/:id` | ❌ | Admin - Edit Airline |
| 5.4 | Delete Airline (Admin) | DELETE | `/airline/:id` | ❌ | Admin - Delete Airline |
| 5.5 | Get Airline by ID | GET | `/airline/:id` | ❌ | Airline Details |
| 5.6 | Get Airline Flights | GET | `/airline/:id/flights` | ❌ | Airline Flights List |

---

## 📊 **6. REPORTS & ANALYTICS APIs**

### 6.1 Daily/Monthly Booking Reports

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 6.1.1 | Get Daily Bookings Report | POST | `/report/daily-bookings` | ❌ | Admin - Daily Report |
| 6.1.2 | Get Monthly Bookings Report | POST | `/report/monthly-bookings` | ❌ | Admin - Monthly Report |
| 6.1.3 | Get Booking Trends | POST | `/report/booking-trends` | ❌ | Admin - Trends Report |
| 6.1.4 | Get Bookings by Date Range | POST | `/report/bookings-range` | ❌ | Custom Reports |

### 6.2 Revenue Reports

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 6.2.1 | Get Daily Revenue | POST | `/report/daily-revenue` | ❌ | Admin - Revenue |
| 6.2.2 | Get Monthly Revenue | POST | `/report/monthly-revenue` | ❌ | Admin - Revenue |
| 6.2.3 | Get Revenue by Airline | GET | `/report/revenue-by-airline` | ❌ | Admin - Analytics |
| 6.2.4 | Get Revenue Trends | POST | `/report/revenue-trends` | ❌ | Admin - Trends |

### 6.3 Top Performing Routes & Analytics

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 6.3.1 | Get Top Routes | GET | `/report/top-routes` | ❌ | Admin - Routes Report |
| 6.3.2 | Get Route by Source-Dest | POST | `/report/route-analytics` | ❌ | Admin - Route Analysis |
| 6.3.3 | Get Most Booked Routes | GET | `/report/most-booked-routes` | ❌ | Analytics |
| 6.3.4 | Get Revenue by Route | POST | `/report/revenue-by-route` | ❌ | Admin - Revenue |
| 6.3.5 | Get Top Performing Flights | GET | `/report/top-flights` | ❌ | Admin - Analytics |

### 6.4 Statistical Reports

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 6.4.1 | Get Dashboard Statistics | GET | `/report/dashboard-stats` | ❌ | Admin Dashboard |
| 6.4.2 | Get Users Statistics | GET | `/report/user-stats` | ❌ | Admin Analytics |
| 6.4.3 | Get Booking Statistics | GET | `/report/booking-stats` | ❌ | Admin Analytics |
| 6.4.4 | Get Financial Summary | POST | `/report/financial-summary` | ❌ | Admin Dashboard |

---

## 📋 **7. FLIGHT STATUS APIs**

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 7.1 | Get Flight Status | GET | `/flight/:id/status` | ❌ | Flight Status Page |
| 7.2 | Update Flight Status | PUT | `/flight/:id/status` | ❌ | Admin - Status Update |
| 7.3 | Get All Flight Status | GET | `/flight-status/list` | ❌ | Flight Status Display |
| 7.4 | Search Flight by Number | GET | `/flight/search?number=X` | ❌ | Flight Status Search |
| 7.5 | Get Flight Delays | GET | `/report/flight-delays` | ❌ | Admin - Delays Report |

---

## 🎁 **8. DEALS & OFFERS APIs**

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 8.1 | Get All Deals | GET | `/deal/list` | ❌ | Deals Page |
| 8.2 | Get Active Deals | GET | `/deal/active` | ❌ | Deals Display |
| 8.3 | Add Deal (Admin) | POST | `/deal/add` | ❌ | Admin - Add Deal |
| 8.4 | Update Deal (Admin) | PUT | `/deal/:id` | ❌ | Admin - Edit Deal |
| 8.5 | Delete Deal (Admin) | DELETE | `/deal/:id` | ❌ | Admin - Delete Deal |
| 8.6 | Apply Coupon Code | POST | `/deal/apply-coupon` | ❌ | Booking - Discount |
| 8.7 | Validate Coupon | POST | `/deal/validate-coupon` | ❌ | Booking Validation |
| 8.8 | Get Deal by ID | GET | `/deal/:id` | ❌ | Deal Details |

---

## ❓ **9. ISSUE/SUPPORT APIs**

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 9.1 | Add Issue | POST | `/issue/addissue` | ✅ | Contact Us Page |
| 9.2 | Get Issues (Admin) | POST | `/issue/getissues` | ✅ | Admin - Issue Display |
| 9.3 | Get Issue by ID | GET | `/issue/:id` | ❌ | Issue Details |
| 9.4 | Update Issue Status | PUT | `/issue/:id` | ❌ | Admin - Update Issue |
| 9.5 | Delete Issue (Admin) | DELETE | `/issue/:id` | ❌ | Admin - Delete Issue |
| 9.6 | Get All Issues (Paginated) | GET | `/issue/list?page=X` | ❌ | Admin Dashboard |
| 9.7 | Search Issues (Admin) | POST | `/issue/search` | ❌ | Admin - Search Issues |
| 9.8 | Add Issue Resolution | PUT | `/issue/:id/resolution` | ❌ | Admin - Add Resolution |

---

## 💳 **10. PAYMENT APIs** (If Applicable)

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 10.1 | Process Payment | POST | `/payment/process` | ❌ | Booking Payment |
| 10.2 | Get Payment Status | GET | `/payment/:id/status` | ❌ | Payment Verification |
| 10.3 | Refund Payment | POST | `/payment/:id/refund` | ❌ | Cancellation Refund |
| 10.4 | Get Payment History | GET | `/user/:id/payments` | ❌ | User Payment History |

---

## 📮 **11. NOTIFICATION APIs** (Optional)

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 11.1 | Send Email | POST | `/notification/email` | ❌ | Booking Confirmation |
| 11.2 | Send SMS | POST | `/notification/sms` | ❌ | Alert/Reminder |
| 11.3 | Get Notifications | GET | `/notification/list` | ❌ | User Notifications |
| 11.4 | Mark as Read | PUT | `/notification/:id/read` | ❌ | Notification Status |

---

## 📁 **12. FILE UPLOAD APIs** (Optional)

| # | API | Method | Endpoint | Status | Used By |
|---|-----|--------|----------|--------|---------|
| 12.1 | Upload Profile Picture | POST | `/upload/profile-pic` | ❌ | Profile Management |
| 12.2 | Upload Document | POST | `/upload/document` | ❌ | Verification |
| 12.3 | Generate Invoice PDF | GET | `/invoice/:id/download` | ❌ | Invoice Download |

---

## 📊 **SUMMARY TABLE**

```
Category                    | Total APIs | Implemented | Missing | Priority
--------------------------|------------|------------|---------|----------
Authentication             |     7      |     2      |    5    | 🔴 HIGH
Flight Management          |    14      |     2      |   12    | 🔴 HIGH
Booking Management         |    10      |     2      |    8    | 🔴 HIGH
User Management            |    10      |     3      |    7    | 🔴 HIGH
Airline Management         |     6      |     0      |    6    | 🟡 MEDIUM
Reports & Analytics        |    15      |     0      |   15    | 🔴 HIGH
Flight Status              |     5      |     0      |    5    | 🟡 MEDIUM
Deals & Offers             |     8      |     0      |    8    | 🟡 MEDIUM
Issue/Support              |     8      |     2      |    6    | 🟡 MEDIUM
Payment                    |     4      |     0      |    4    | 🟢 LOW
Notifications              |     4      |     0      |    4    | 🟢 LOW
File Upload                |     3      |     0      |    3    | 🟢 LOW
--------------------------|------------|------------|---------|----------
TOTAL                      |    94      |    12      |   82    |
```

---

## ✅ **IMPLEMENTED (12 APIs)**

1. ✅ `POST /auth/signup` - User Signup
2. ✅ `POST /auth/login` - User Login
3. ✅ `POST /flight/getflights` - Get Flights with Filter
4. ✅ `POST /flight/addFlight` - Add New Flight
5. ✅ `POST /flight/booking/newbooking` - Create Booking
6. ✅ `POST /flight/booking/getbookings` - Get User Bookings
7. ✅ `POST /user/userdata` - Get User Data
8. ✅ `POST /user/updatedata` - Update User Data
9. ✅ `POST /user/changepassword` - Change Password
10. ✅ `POST /issue/addissue` - Add Issue
11. ✅ `POST /issue/getissues` - Get Issues
12. ✅ `GET /flights` (Basic) - Get Flights List

---

## ❌ **MISSING (82 APIs) - Need to Create**

### 🔴 **CRITICAL PRIORITY** (30 APIs)

**Authentication (5):**
- [ ] POST /auth/logout
- [ ] POST /auth/refresh-token
- [ ] GET /auth/verify-token
- [ ] POST /auth/forgot-password
- [ ] POST /auth/reset-password/:token

**Flight Management (12):**
- [ ] GET /flight/:id
- [ ] PUT /flight/:id
- [ ] DELETE /flight/:id
- [ ] POST /flight/search
- [ ] GET /flight/list?page=X&limit=Y
- [ ] POST /flight/by-route
- [ ] POST /flight/filter/source
- [ ] POST /flight/filter/destination
- [ ] POST /flight/filter/date-range
- [ ] POST /flight/filter/price-range
- [ ] POST /flight/filter/airline
- [ ] POST /flight/advanced-search

**Booking Management (8):**
- [ ] GET /booking/:id
- [ ] PUT /booking/:id
- [ ] DELETE /booking/:id
- [ ] POST /booking/:id/confirm
- [ ] GET /bookings/list?page=X
- [ ] POST /bookings/search
- [ ] PUT /booking/:id/status
- [ ] GET /booking/:id/invoice

**User Management (5):**
- [ ] GET /user/:id
- [ ] GET /users/list?page=X&limit=Y
- [ ] DELETE /user/:id
- [ ] PUT /user/:id/role
- [ ] POST /users/search

### 🟡 **MEDIUM PRIORITY** (37 APIs)

**Airlines (6):**
- [ ] GET /airline/list
- [ ] POST /airline/add
- [ ] PUT /airline/:id
- [ ] DELETE /airline/:id
- [ ] GET /airline/:id
- [ ] GET /airline/:id/flights

**Reports (15):**
- [ ] POST /report/daily-bookings
- [ ] POST /report/monthly-bookings
- [ ] POST /report/booking-trends
- [ ] POST /report/bookings-range
- [ ] POST /report/daily-revenue
- [ ] POST /report/monthly-revenue
- [ ] GET /report/revenue-by-airline
- [ ] POST /report/revenue-trends
- [ ] GET /report/top-routes
- [ ] POST /report/route-analytics
- [ ] GET /report/most-booked-routes
- [ ] POST /report/revenue-by-route
- [ ] GET /report/top-flights
- [ ] GET /report/dashboard-stats
- [ ] GET /report/financial-summary

**Flight Status (5):**
- [ ] GET /flight/:id/status
- [ ] PUT /flight/:id/status
- [ ] GET /flight-status/list
- [ ] GET /flight/search?number=X
- [ ] GET /report/flight-delays

**Deals & Offers (8):**
- [ ] GET /deal/list
- [ ] GET /deal/active
- [ ] POST /deal/add
- [ ] PUT /deal/:id
- [ ] DELETE /deal/:id
- [ ] POST /deal/apply-coupon
- [ ] POST /deal/validate-coupon
- [ ] GET /deal/:id

**Issues (6):**
- [ ] GET /issue/:id
- [ ] PUT /issue/:id
- [ ] DELETE /issue/:id
- [ ] GET /issue/list?page=X
- [ ] POST /issue/search
- [ ] PUT /issue/:id/resolution

### 🟢 **LOW PRIORITY** (15 APIs)

**Payment (4):**
- [ ] POST /payment/process
- [ ] GET /payment/:id/status
- [ ] POST /payment/:id/refund
- [ ] GET /user/:id/payments

**Notifications (4):**
- [ ] POST /notification/email
- [ ] POST /notification/sms
- [ ] GET /notification/list
- [ ] PUT /notification/:id/read

**File Upload (3):**
- [ ] POST /upload/profile-pic
- [ ] POST /upload/document
- [ ] GET /invoice/:id/download

---

## 🎯 **IMMEDIATE ACTION ITEMS**

### **Phase 1 - CRITICAL (Complete First)**
Implement these 30 APIs:
1. All Authentication endpoints (5)
2. Flight CRUD + Search (12)
3. Booking CRUD + Status (8)
4. User Management (5)

**Estimated Time:** 2-3 days

### **Phase 2 - IMPORTANT (Next)**
Implement these 20 APIs:
1. Airlines Management (6)
2. Reports & Analytics (15) - At least basic ones

**Estimated Time:** 2-3 days

### **Phase 3 - NICE-TO-HAVE**
1. Deals & Offers (8)
2. Flight Status (5)
3. Issues Management (6)

**Estimated Time:** 2-3 days

### **Phase 4 - OPTIONAL**
1. Payment Integration (4)
2. Notifications (4)
3. File Upload (3)

**Estimated Time:** 2-3 days

---

## 📝 **CHECKLIST - Use This to Track Progress**

Print this and check off as you implement:

```
AUTHENTICATION
[ ] POST /auth/logout
[ ] POST /auth/refresh-token
[ ] GET /auth/verify-token
[ ] POST /auth/forgot-password
[ ] POST /auth/reset-password/:token

FLIGHT MANAGEMENT
[ ] GET /flight/:id
[ ] PUT /flight/:id
[ ] DELETE /flight/:id
[ ] POST /flight/search
[ ] GET /flight/list?page=X&limit=Y
[ ] POST /flight/by-route
[ ] POST /flight/filter/* (all filters)
[ ] POST /flight/advanced-search

BOOKING MANAGEMENT
[ ] GET /booking/:id
[ ] PUT /booking/:id
[ ] DELETE /booking/:id
[ ] POST /booking/:id/confirm
[ ] GET /bookings/list?page=X
[ ] POST /bookings/search
[ ] PUT /booking/:id/status
[ ] GET /booking/:id/invoice

USER MANAGEMENT
[ ] GET /user/:id
[ ] GET /users/list?page=X&limit=Y
[ ] DELETE /user/:id
[ ] PUT /user/:id/role
[ ] POST /users/search

... and more
```

---

## 🚀 **QUICK START**

1. **Copy this list to your backend team**
2. **Start with CRITICAL Priority APIs**
3. **Test each API with Postman**
4. **Update as you implement**
5. **Share backend URL with frontend team**

Your frontend is **100% ready** - just waiting for these APIs! ✅
