# 🔧 Backend API Implementation Guide

## Complete List of APIs Needed for Admin Panel

Base URL: `http://localhost:3001`  
Authentication Header: `authorization: "d8c03b5e-29aa-4708-b55d-5d32b2a7295b <jwt_token>"`

---

## 📊 1. FLIGHT MANAGEMENT APIs

### 1.1 Get All Flights (Paginated)
```javascript
// Already have similar endpoint - modify to support pagination
GET /admin/flights/list
Body: {
  page: number,      // 1, 2, 3...
  limit: number      // 10, 20, 50...
}

Response:
{
  success: true,
  data: [
    {
      _id: ObjectId,
      flightNumber: string,
      airline: string,
      source: string,
      destination: string,
      departureTime: datetime,
      arrivalTime: datetime,
      price: number,
      availableSeats: number,
      totalSeats: number
    }
  ],
  total: number,
  page: number,
  pages: number
}
```

### 1.2 Get Single Flight
```javascript
GET /admin/flights/:id

Response:
{
  success: true,
  data: {
    _id: ObjectId,
    flightNumber: string,
    airline: string,
    source: string,
    destination: string,
    departureTime: datetime,
    arrivalTime: datetime,
    price: number,
    availableSeats: number,
    totalSeats: number
  }
}
```

### 1.3 Create Flight
```javascript
// Already exists as POST /flight/addFlight
// No changes needed - reuse existing
POST /flight/addFlight
```

### 1.4 Update Flight
```javascript
PUT /admin/flights/:id
Body: {
  flightNumber?: string,
  airline?: string,
  source?: string,
  destination?: string,
  departureTime?: datetime,
  arrivalTime?: datetime,
  price?: number,
  availableSeats?: number,
  totalSeats?: number
}

Response:
{
  success: true,
  data: {
    modifiedCount: 1
  }
}
```

### 1.5 Delete Flight
```javascript
DELETE /admin/flights/:id

Response:
{
  success: true,
  data: {
    deletedCount: 1
  }
}
```

### 1.6 Search Flights
```javascript
POST /admin/flights/search
Body: {
  query: string,    // search by flight number, airline, route
  page: number
}

Response:
{
  success: true,
  data: [
    // ... flight objects
  ],
  total: number
}
```

---

## 👥 2. USER MANAGEMENT APIs

### 2.1 Get All Users (Paginated)
```javascript
GET /admin/users/list
Body: {
  page: number,
  limit: number
}

Response:
{
  success: true,
  data: [
    {
      _id: ObjectId,
      username: string,
      name: string,
      email: string,
      phoneNo: string,
      role: "admin" | "user",
      createdAt: datetime
    }
  ],
  total: number,
  page: number,
  pages: number
}
```

### 2.2 Get Single User
```javascript
GET /admin/users/:id

Response:
{
  success: true,
  data: {
    _id: ObjectId,
    username: string,
    name: string,
    email: string,
    phoneNo: string,
    role: string,
    createdAt: datetime
  }
}
```

### 2.3 Update User (Role, Status)
```javascript
PUT /admin/users/:id
Body: {
  name?: string,
  email?: string,
  phoneNo?: string,
  role?: "admin" | "user"
}

Response:
{
  success: true,
  data: {
    modifiedCount: 1
  }
}
```

### 2.4 Delete User
```javascript
DELETE /admin/users/:id

Response:
{
  success: true,
  data: {
    deletedCount: 1
  }
}
```

### 2.5 Search Users
```javascript
POST /admin/users/search
Body: {
  query: string,    // search by username, email, name
  page: number
}

Response:
{
  success: true,
  data: [
    // ... user objects
  ],
  total: number
}
```

---

## 📝 3. BOOKING MANAGEMENT APIs

### 3.1 Get All Bookings (Paginated)
```javascript
GET /admin/bookings/list
Body: {
  page: number,
  limit: number
}

Response:
{
  success: true,
  data: [
    {
      _id: ObjectId,
      userId: ObjectId,
      userName: string,
      flightId: ObjectId,
      flightNumber: string,
      numberOfPassengers: number,
      totalPrice: number,
      status: "Pending" | "Confirmed" | "Cancelled",
      bookingDate: datetime
    }
  ],
  total: number,
  page: number,
  pages: number
}
```

### 3.2 Get Single Booking
```javascript
GET /admin/bookings/:id

Response:
{
  success: true,
  data: {
    _id: ObjectId,
    userId: ObjectId,
    userName: string,
    flightId: ObjectId,
    flightNumber: string,
    numberOfPassengers: number,
    totalPrice: number,
    status: string,
    bookingDate: datetime,
    passengers: [
      {
        name: string,
        age: number,
        seatNumber: string
      }
    ]
  }
}
```

### 3.3 Update Booking Status
```javascript
PUT /admin/bookings/:id
Body: {
  status: "Pending" | "Confirmed" | "Cancelled"
}

Response:
{
  success: true,
  data: {
    modifiedCount: 1
  }
}
```

### 3.4 Delete Booking
```javascript
DELETE /admin/bookings/:id

Response:
{
  success: true,
  data: {
    deletedCount: 1
  }
}
```

### 3.5 Search Bookings
```javascript
POST /admin/bookings/search
Body: {
  query: string,    // search by booking ID, flight number, user name
  page: number
}

Response:
{
  success: true,
  data: [
    // ... booking objects
  ],
  total: number
}
```

---

## ❓ 4. ISSUE MANAGEMENT APIs

### 4.1 Get All Issues (Paginated)
```javascript
GET /admin/issues/list
Body: {
  page: number,
  limit: number
}

Response:
{
  success: true,
  data: [
    {
      _id: ObjectId,
      userId: ObjectId,
      userName: string,
      subject: string,
      description: string,
      status: "Open" | "In Progress" | "Resolved" | "Closed",
      createdAt: datetime,
      updatedAt: datetime
    }
  ],
  total: number,
  page: number,
  pages: number
}
```

### 4.2 Get Single Issue
```javascript
GET /admin/issues/:id

Response:
{
  success: true,
  data: {
    _id: ObjectId,
    userId: ObjectId,
    userName: string,
    subject: string,
    description: string,
    status: string,
    resolution: string,
    createdAt: datetime,
    updatedAt: datetime
  }
}
```

### 4.3 Update Issue (Status & Resolution)
```javascript
PUT /admin/issues/:id
Body: {
  status?: "Open" | "In Progress" | "Resolved" | "Closed",
  resolution?: string  // admin's resolution notes
}

Response:
{
  success: true,
  data: {
    modifiedCount: 1
  }
}
```

### 4.4 Delete Issue
```javascript
DELETE /admin/issues/:id

Response:
{
  success: true,
  data: {
    deletedCount: 1
  }
}
```

### 4.5 Search Issues
```javascript
POST /admin/issues/search
Body: {
  query: string,    // search by subject, issue ID, user name
  page: number
}

Response:
{
  success: true,
  data: [
    // ... issue objects
  ],
  total: number
}
```

---

## ✅ EXISTING APIs (Already Implemented)

These APIs already exist and should NOT be modified:

```javascript
// Flights
POST /flight/getflights           ✅ Used in flight-booking
POST /flight/addFlight            ✅ Used in add-flight

// Users
POST /user/userdata               ✅ Used in account-settings
POST /user/updatedata             ✅ Used in account-settings
POST /user/changepassword         ✅ Used in account-settings

// Issues
POST /issue/getissues             ✅ Used in display-issues
POST /issue/addissue              ✅ Used in contact-us

// Auth
POST /auth/login                  ✅ Used in login-page
POST /auth/signup                 ✅ Used in signup
```

---

## 🔐 Authentication Notes

All new endpoints must:
1. Check JWT token in authorization header
2. Verify token is valid
3. Check user is ADMIN role
4. Return 401 if unauthorized
5. Return 403 if not admin role

Example Middleware:
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "PREFIX token"
  
  if (!token) return res.status(401).json({ error: 'No token' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Not admin' });
    
    req.user = user;
    next();
  });
};
```

---

## 🚀 Implementation Priority

**Phase 1 (Critical):** Flights, Users, Bookings (20 endpoints)
**Phase 2 (Important):** Issues Management (5 endpoints)
**Phase 3 (Optional):** Analytics, Reports

---

## 📋 Sample Implementation (Node.js/Express)

```javascript
// FLIGHT ENDPOINTS
router.post('/admin/flights/list', authenticateToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.body;
  const skip = (page - 1) * limit;
  
  const flights = await db.collection('flights')
    .find({})
    .skip(skip)
    .limit(limit)
    .toArray();
    
  const total = await db.collection('flights').countDocuments();
  
  res.json({
    success: true,
    data: flights,
    total,
    page,
    pages: Math.ceil(total / limit)
  });
});

router.get('/admin/flights/:id', authenticateToken, async (req, res) => {
  const flight = await db.collection('flights')
    .findOne({ _id: new ObjectId(req.params.id) });
  
  res.json({ success: true, data: flight });
});

// Similar pattern for other CRUD operations...
```

---

## 📞 Questions?

Check the frontend AdminService at:  
`src/app/pages/admin/services/admin.service.ts`

All method signatures and expected parameters are documented there!
