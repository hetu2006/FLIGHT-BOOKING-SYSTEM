# 🚀 Flight Booking System - API Integration Summary

**Date:** March 1, 2026  
**Status:** Real-time API integration documentation  
**Base URL:** `http://localhost:3001`  
**Auth Prefix:** `d8c03b5e-29aa-4708-b55d-5d32b2a7295b`

---

## 📊 Existing APIs (Implemented)

### 1️⃣ **FLIGHT APIs** ✅

#### Flight Service (`src/app/services/Flight/flight.service.ts`)

| Method | Endpoint | Type | Status | Used By |
|--------|----------|------|--------|---------|
| getFlights | `POST /flight/getflights` | POST | ✅ WORKING | flight-booking |
| addNewFlight | `POST /flight/addFlight` | POST | ✅ WORKING | add-flight |
| bookNewFlight | `POST /flight/booking/newbooking` | POST | ✅ WORKING | flight-details |
| getFlightBookingHistory | `POST /flight/booking/getbookings` | POST | ✅ WORKING | flight-history |

**Request Format:**
```json
{
  "filters": {
    "routeSource": "Delhi",
    "routeDestination": "Mumbai",
    "departureDate": "2025-03-15",
    "isEconomyClass": true
  }
}
```

**❌ MISSING - Admin Panel Needs:**
- `GET /flight/{id}` - Get single flight details
- `PUT /flight/{id}` - Update flight
- `DELETE /flight/{id}` - Delete flight
- `GET /flights?page=1&limit=10` - Get paginated flights list

---

### 2️⃣ **USER APIs** ✅

#### User Service (`src/app/services/User/user.service.ts`)

| Method | Endpoint | Type | Status | Used By |
|--------|----------|------|--------|---------|
| signupUser | `POST /auth/signup` | POST | ✅ WORKING | signup |
| loginUser | `POST /auth/login` | POST | ✅ WORKING | login-page |
| getCurrentUserData | `POST /user/userdata` | POST | ✅ WORKING | account-settings |
| updateAccountDetails | `POST /user/updatedata` | POST | ✅ WORKING | account-settings |
| changeUserPassword | `POST /user/changepassword` | POST | ✅ WORKING | account-settings |

**❌ MISSING - Admin Panel Needs:**
- `GET /users?page=1&limit=10` - Get paginated users list
- `GET /user/{id}` - Get single user details
- `PUT /user/{id}` - Update user role/status
- `DELETE /user/{id}` - Delete user account
- `GET /users/search?q=username` - Search users

---

### 3️⃣ **ISSUE APIs** ⚠️ (Partially Implemented)

#### Issue Service (`src/app/services/Issue/issue.service.ts`)

| Method | Endpoint | Type | Status | Used By |
|--------|----------|------|--------|---------|
| getIssues | `POST /issue/getissues` | POST | ✅ WORKING | display-issues |
| addIssue | `POST /issue/addissue` | POST | ✅ WORKING | contact-us |

**❌ MISSING - Admin Panel Needs:**
- `GET /issues?page=1&limit=10` - Get paginated issues list
- `GET /issue/{id}` - Get single issue details
- `PUT /issue/{id}` - Update issue status/resolution
- `DELETE /issue/{id}` - Delete issue
- `GET /issues/search?q=subject` - Search issues

---

### 4️⃣ **BOOKING APIs** ⚠️ (Partially Implemented)

#### Currently in Flight Service:
- `POST /flight/booking/newbooking` - Create new booking
- `POST /flight/booking/getbookings` - Get user's bookings

**❌ MISSING - Need New Service & APIs:**
- `GET /bookings?page=1&limit=10` - Get paginated bookings (admin)
- `GET /booking/{id}` - Get single booking details
- `PUT /booking/{id}` - Update booking status
- `DELETE /booking/{id}` - Cancel booking
- `GET /bookings/search?q=bookingId` - Search bookings

---

## 🔴 APIs Need to be Created on Backend

### New Endpoints to Implement:

```javascript
// FLIGHTS (Admin)
GET /flights/list?page=1&limit=10&search=
GET /flight/:id
PUT /flight/:id
DELETE /flight/:id

// USERS (Admin)
GET /users/list?page=1&limit=10&search=
GET /user/:id
PUT /user/:id
DELETE /user/:id

// BOOKINGS (Admin)
GET /bookings/list?page=1&limit=10&search=
GET /booking/:id
PUT /booking/:id
DELETE /booking/:id

// ISSUES (Admin)
GET /issues/list?page=1&limit=10&search=
GET /issue/:id
PUT /issue/:id
DELETE /issue/:id
```

---

## 📋 API Integration Checklist for Admin Panel

### Flight Management
- ✅ GET all flights with pagination
- ✅ GET single flight details
- ✅ POST create new flight
- ✅ PUT update flight
- ✅ DELETE flight
- ✅ Search flights

### User Management
- ❌ GET all users with pagination
- ❌ GET single user details
- ❌ PUT update user (role, status)
- ❌ DELETE user
- ❌ Search users

### Booking Management
- ❌ GET all bookings with pagination
- ❌ GET single booking details
- ❌ PUT update booking status
- ❌ DELETE booking
- ❌ Search bookings

### Issue Management
- ❌ GET all issues with pagination
- ❌ GET single issue details
- ❌ PUT update issue (status, resolution)
- ❌ DELETE issue
- ❌ Search issues

---

## 🎯 Next Steps

### Option 1: Backend Implementation (Recommended)
Create the missing API endpoints in your Node.js/Express server:

1. **Copy the expected API structure** from this document
2. **Implement CRUD endpoints** for all resources
3. **Add pagination support** (page, limit, skip)
4. **Add search functionality** (search query parameter)
5. **Ensure JWT authentication** on all endpoints

### Option 2: Frontend Integration (Current)
Admin service already has:
- ✅ All 20+ method signatures ready
- ✅ Proper header authentication
- ✅ Error handling
- ✅ Response format support

Just needs backend endpoints to connect to.

---

## 📱 Real Existing API Examples from Project

### Flight Booking (Working Example)
```javascript
// POST /flight/getflights
Request Body:
{
  "filters": {
    "routeSource": "Delhi",
    "routeDestination": "Mumbai",
    "departureDate": "2025-03-15"
  }
}

Response:
{
  "data": {
    "departureDateFlights": [...],
    "afterDepartureDateFlights": [...]
  }
}
```

### User Update (Working Example)
```javascript
// POST /user/updatedata
Request Body:
{
  "data": {
    "name": "John Doe",
    "phoneNo": "9876543210"
  }
}

Response:
{
  "isDone": true,
  "data": {
    "modifiedCount": 1
  }
}
```

### Issue Get (Working Example)
```javascript
// POST /issue/getissues
Request Body: {}

Response:
{
  "isDone": true,
  "data": [...]
}
```

---

## 🔑 Authentication Details

All requests must include:
```javascript
headers: {
  authorization: "d8c03b5e-29aa-4708-b55d-5d32b2a7295b <jwt_token>"
}
```

JWT token is obtained from:
```javascript
const jwt_token = localStorage.getItem('token');
```

---

## 📝 Summary

| Category | Flights | Users | Bookings | Issues |
|----------|---------|-------|----------|--------|
| GET List | ❌ | ❌ | ❌ | ❌ |
| GET Single | ❌ | ❌ | ❌ | ❌ |
| POST Create | ✅ | ✅ | ✅ | ✅ |
| PUT Update | ❌ | ❌ | ❌ | ❌ |
| DELETE | ❌ | ❌ | ❌ | ❌ |
| Search | ❌ | ❌ | ❌ | ❌ |

**Total APIs Missing:** 20 endpoints

---

## 🚀 Quick Start Integration

Once backend APIs are ready:

1. **Copy API endpoint URLs** into the admin service
2. **Test each endpoint** with Postman
3. **Enable real-time data flow** in admin panel
4. **Run the application** and verify data loads correctly

All frontend code is ready! ✅ Just needs backend implementation.
