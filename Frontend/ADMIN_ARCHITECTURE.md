# Admin Panel Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Flight Booking System                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┬──────────────────────────────────┐  │
│  │   User Portal        │        Admin Panel ✨ NEW         │  │
│  │                      │                                  │  │
│  │ ├── Home             │ ├── Dashboard                    │  │
│  │ ├── Login            │ ├── Flights Manager             │  │
│  │ ├── Flights Search   │ ├── Users Manager              │  │
│  │ ├── Booking          │ ├── Bookings Manager           │  │
│  │ ├── Flight History   │ └── Issues Manager             │  │
│  │ ├── Account          │                                  │  │
│  │ └── Report Issue     │  Features:                       │  │
│  │                      │  • Search functionality          │  │
│  │                      │  • Pagination                    │  │
│  │                      │  • CRUD Operations               │  │
│  │                      │  • Beautiful UI                  │  │
│  │                      │  • Animations                    │  │
│  │                      │  • Responsive Design             │  │
│  └──────────────────────┴──────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              API Services Layer                         │  │
│  │  ┌────────────────┬──────────┬──────────┬────────────┐  │  │
│  │  │ FlightService  │ UserSvc  │ BookSvc  │ IssueSvc   │  │  │
│  │  └────────────────┴──────────┴──────────┴────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │         AdminService (NEW)                       │  │  │
│  │  │  - getAllFlights(), createFlight(), etc...       │  │  │
│  │  │  - getAllUsers(), updateUser(), etc...           │  │  │
│  │  │  - getAllBookings(), updateBooking(), etc...     │  │  │
│  │  │  - getAllIssues(), updateIssue(), etc...         │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │         HTTP Client with Token Authentication          │  │
│  │  Headers: { Authorization: TOKEN_PREFIX + TOKEN }      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    Backend Server
                  (http://localhost:3001)
                  NodeJS/Express/MongoDB
```

---

## Admin Panel Component Structure

```
AdminModule
│
├── AdminDashboardComponent (Main Container)
│   ├── Sidebar Navigation
│   │   ├── Flights Link
│   │   ├── Users Link
│   │   ├── Bookings Link
│   │   ├── Issues Link
│   │   └── Logout Button
│   │
│   ├── Top Header
│   │   ├── Title
│   │   ├── Toggle Button (Mobile)
│   │   └── User Info
│   │
│   └── Router Outlet (Child Components)
│       │
│       ├── AdminFlightsComponent
│       │   ├── Search Bar
│       │   ├── Add Button → Modal Form
│       │   ├── Flights Table
│       │   │   ├── Flight Data Rows
│       │   │   ├── Edit Icon → Edit Modal
│       │   │   └── Delete Icon → Confirm Dialog
│       │   └── Pagination
│       │
│       ├── AdminUsersComponent
│       │   ├── Search Bar
│       │   ├── Users Table
│       │   │   ├── User Data Rows
│       │   │   ├── Edit Icon → Edit Modal
│       │   │   └── Delete Icon → Confirm Dialog
│       │   └── Pagination
│       │
│       ├── AdminBookingsComponent
│       │   ├── Search Bar
│       │   ├── Bookings Table
│       │   │   ├── Booking Data Rows
│       │   │   ├── Edit Icon → Edit Modal
│       │   │   └── Delete Icon → Confirm Dialog
│       │   └── Pagination
│       │
│       └── AdminIssuesComponent
│           ├── Search Bar
│           ├── Issues Table
│           │   ├── Issue Data Rows
│           │   ├── Edit Icon → Edit Modal
│           │   └── Delete Icon → Confirm Dialog
│           └── Pagination
│
└── AdminService
    ├── Flights Methods
    │   ├── getAllFlights(page, limit)
    │   ├── getFlightById(id)
    │   ├── createFlight(data)
    │   ├── updateFlight(id, data)
    │   ├── deleteFlight(id)
    │   └── searchFlights(query, page)
    │
    ├── Users Methods
    │   ├── getAllUsers(page, limit)
    │   ├── getUserById(id)
    │   ├── updateUser(id, data)
    │   ├── deleteUser(id)
    │   └── searchUsers(query, page)
    │
    ├── Bookings Methods
    │   ├── getAllBookings(page, limit)
    │   ├── getBookingById(id)
    │   ├── updateBooking(id, data)
    │   ├── deleteBooking(id)
    │   └── searchBookings(query, page)
    │
    └── Issues Methods
        ├── getAllIssues(page, limit)
        ├── getIssueById(id)
        ├── updateIssue(id, data)
        ├── deleteIssue(id)
        └── searchIssues(query, page)
```

---

## User Flow Diagram

```
┌─────────┐
│  Start  │
└────┬────┘
     │
     ▼
┌─────────────────┐
│  Login Page     │
│  (Success)      │
└────┬────────────┘
     │
     ▼
┌─────────────────────────┐
│  Flight Booking App     │
│  (Header with links)    │
└────┬────────────────────┘
     │
     │ [Click Admin Link if Admin]
     ▼
┌─────────────────────────┐
│  /admin Route           │
│  (with UserLoginGuard)  │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Admin Dashboard                │
│  ┌──────────────────────────┐   │
│  │ ┌──────────────────────┐ │   │
│  │ │  Sidebar Navigation  │ │   │
│  │ │  [Flights]           │ │   │
│  │ │  [Users]             │ │   │
│  │ │  [Bookings]          │ │   │
│  │ │  [Issues]            │ │   │
│  │ │  [Logout]            │ │   │
│  │ └──────────────────────┘ │   │
│  │  Main Content Area        │   │
│  └──────────────────────────┘   │
└─────┬──────┬──────┬──────┬───────┘
      │      │      │      │
      ▼      ▼      ▼      ▼
   Flights Users Books Issues
   Manager Mgr   Mgr    Mgr
```

---

## Data Flow in Table Operations

```
User Action (Click Edit/Delete)
│
├─► Edit Action
│   │
│   ▼
│   Open Modal with Form
│   │
│   ▼
│   User Modifies Data
│   │
│   ▼
│   Click "Update"
│   │
│   ▼
│   AdminService.updateXXX(id, data)
│   │
│   ▼
│   HTTP PUT Request to Backend
│   │
│   ▼
│   Success Response
│   │
│   ▼
│   Reload Data (loadXXX())
│   │
│   ▼
│   Close Modal
│   │
│   ▼
│   Show Success Message
│   │
│   ▼
│   Update UI with New Data
│
└─► Delete Action
    │
    ▼
    Show Confirmation Dialog
    │
    ▼
    User Confirms
    │
    ▼
    AdminService.deleteXXX(id)
    │
    ▼
    HTTP DELETE Request to Backend
    │
    ▼
    Success Response
    │
    ▼
    Reload Data (loadXXX())
    │
    ▼
    Show Success Message
    │
    ▼
    Item Removed from UI
```

---

## API Request/Response Flow

```
Frontend (Angular Admin Panel)
│
├─ Http Request ──────────────────────────┐
│  Method: POST/GET/PUT/DELETE            │
│  URL: http://localhost:3001/api/admin/xx│
│  Headers: {                              │
│    Authorization: 'd8c03b5e-... token'   │
│  }                                       │
│  Body: { data... }                       │
│                                          │
│                                          ▼
│                            Backend Server (NodeJS)
│                            │
│                            ├─ Authenticate Token
│                            │  ├─ Valid? → Continue
│                            │  └─ Invalid? → 401 Error
│                            │
│                            ├─ Authorize User
│                            │  ├─ Is Admin? → Continue
│                            │  └─ Not Admin? → 403 Error
│                            │
│                            ├─ Process Request
│                            │  ├─ GET: Query Database
│                            │  ├─ POST: Insert Data
│                            │  ├─ PUT: Update Data
│                            │  └─ DELETE: Remove Data
│                            │
│                            └─ Database (MongoDB)
│                               └─ Return Results
│
│                                          ▼
├─ Http Response ─────────────────────────┐
│  Status: 200/201/400/401/403/500        │
│  Body: {                                 │
│    data: [...],                          │
│    total: 100                            │
│  }                                       │
│                                          │
▼                                          │
Angular Admin Component                    │
├─ Receive Response                        │
├─ Check Status                            │
├─ Update Component Data                   │
├─ Reload Table if Success                 │
├─ Show Error Toast if Error               │
└─ Close Modal if Success                  │
```

---

## Page Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│            Admin Dashboard Top Header                    │
│  [☰] Admin Panel          Welcome, Admin     [Logout]   │
├─┬────────────────────────────────────────────────────────┤
│ │ SIDEBAR                                                │
│ │ ┌──────────────────┐                                  │
│ │ │ Admin Panel      │                                  │
│ │ ├──────────────────┤                                  │
│ │ │ ✈️  Flights       │      Main Content Area          │
│ │ │ 👥 Users         │ ┌────────────────────────────┐  │
│ │ │ 🎫 Bookings      │ │ Page Header               │  │
│ │ │ ⚠️  Issues        │ │ [Page Title]    [+ Add]   │  │
│ │ ├──────────────────┤ ├────────────────────────────┤  │
│ │ │ [Logout]         │ │ 🔍 Search Bar            │  │
│ │ └──────────────────┘ ├────────────────────────────┤  │
│ │                      │ Table:                      │  │
│ │                      │ ┌──────────────────────┐   │  │
│ │                      │ │ Header Row           │   │  │
│ │                      │ ├──────────────────────┤   │  │
│ │                      │ │ Data Row     [✏️ 🗑️]  │   │  │
│ │                      │ │ Data Row     [✏️ 🗑️]  │   │  │
│ │                      │ │ Data Row     [✏️ 🗑️]  │   │  │
│ │                      │ └──────────────────────┘   │  │
│ │                      ├────────────────────────────┤  │
│ │                      │ Pagination:                 │  │
│ │                      │ [Prev] [1] [2] [3] [Next]  │  │
│ │                      └────────────────────────────┘  │
└─┴────────────────────────────────────────────────────────┘
```

---

## Search & Filter Flow

```
User Types in Search Box
│
├─ Input Event Triggered
│
├─ debounce(300ms)
│
├─ Check if query is empty
│  ├─ Yes? Show all items
│  └─ No? Continue
│
├─ Call AdminService.search(query)
│
├─ HTTP POST to /api/admin/xxx/search
│
├─ Backend Filters Data
│
├─ Returns Filtered Results
│
├─ Component Updates filteredItems array
│
├─ Table Re-renders with Filtered Data
│
└─ User Sees Results
```

---

## Modal Dialog Flow

```
User Clicks [+ Add] or [Edit Icon]
│
├─ showModal = true
├─ Load item data if Edit mode
├─ isEditMode = true/false
│
├─ Modal Overlay Appears (fadeIn)
├─ Modal Content Slides In (slideIn)
│
├─ User Fills Form
│
├─ User Clicks [Update/Create]
│
├─ Call AdminService.create/update()
│
├─ Show Loading State
│
├─ Wait for API Response
│
├─ Response Received
│  ├─ Success?
│  │  ├─ Close Modal
│  │  ├─ Reload Data
│  │  └─ Show Success Toast
│  │
│  └─ Error?
│     ├─ Show Error Message
│     └─ Keep Modal Open
│
└─ User Can Try Again or Close
```

---

## State Management in Components

```
AdminFlightsComponent State:

flights: any[] = []              // All flights from API
filteredFlights: any[] = []      // Filtered by search
searchQuery: string = ''         // Current search term
currentPage: number = 1          // Current pagination page
pageSize: number = 10            // Items per page
totalPages: number = 0           // Total pages calculated
totalFlights: number = 0         // Total count from API
isLoading: boolean = false       // Loading state
showModal: boolean = false       // Modal visibility
isEditMode: boolean = false      // Edit vs Add mode
selectedFlight: any = null       // Current flight being edited

formData = {
  flightNumber: '',
  airline: '',
  source: '',
  destination: '',
  departureTime: '',
  arrivalTime: '',
  price: 0,
  availableSeats: 0,
  totalSeats: 0
}
```

---

## HTTP Request Headers

```
Every API Call Includes:
┌──────────────────────────────────────┐
│ Headers: {                           │
│   'Content-Type': 'application/json' │
│   'Authorization':                   │
│     'd8c03b5e-29aa-4708-b55d-...' +  │
│     localStorage.getItem('token')    │
│ }                                    │
└──────────────────────────────────────┘
```

---

## Module Dependency Graph

```
AppModule
│
├─► AdminModule (Lazy-loaded)
│   │
│   ├─► CommonModule
│   ├─► FormsModule
│   ├─► AdminRoutingModule
│   │
│   └─► AdminService
│
├─► Existing Modules
└─► Other Services
```

---

## Route Configuration

```
App Routes
│
├─► '' → HomeComponent
├─► 'login-page' → LoginPageComponent
├─► 'signup' → SignupComponent
├─► ... (other routes)
│
└─► 'admin' → AdminModule (Lazy-loaded)
    │
    ├─► '' → Redirect to 'flights'
    ├─► 'flights' → AdminFlightsComponent
    ├─► 'users' → AdminUsersComponent
    ├─► 'bookings' → AdminBookingsComponent
    └─► 'issues' → AdminIssuesComponent
```

---

This architecture provides:
✅ Clear separation of concerns
✅ Reusable service layer
✅ Lazy-loaded admin module
✅ Type-safe components
✅ Scalable structure
✅ Easy to test
✅ Maintainable code
