# API Testing Guide (Updated Contract)

Date: 2026-03-01

## Base URL

```txt
http://localhost:3001
```

## Auth Header Format

All protected APIs require:

```txt
Authorization: d8c03b5e-29aa-4708-b55d-5d32b2a7295b <JWT_TOKEN>
```

---

## 1. Auth APIs

### POST `/auth/signup`
Supports both old and new payload shapes.

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "phoneNo": "9876543210",
  "address": "Delhi"
}
```

Optional: `username`, `role`.
If `username` missing, backend derives it from email prefix.

Response:

```json
{
  "isDone": true,
  "success": true,
  "message": "User registered successfully",
  "token": "<JWT>",
  "user": {
    "id": "<userId>",
    "name": "John Doe",
    "username": "john",
    "email": "john@example.com",
    "role": "<role>"
  }
}
```

### POST `/auth/login`
Supports login by `username` OR `email` OR `name`.

```json
{
  "username": "john",
  "password": "Password@123"
}
```

or

```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

or

```json
{
  "name": "John Doe",
  "password": "Password@123"
}
```

Response contains `token`, `id`, `username`, `email`, `role`, `name`.

Admin पहचान login response के `role` से होगी (login payload में role भेजने की जरूरत नहीं):

```json
{
  "success": true,
  "token": "<JWT>",
  "username": "admin",
  "role": "6f213caf-88e2-4bb4-9e16-65b3c9b7e9c6"
}
```

- If `role === 6f213caf-88e2-4bb4-9e16-65b3c9b7e9c6` OR `role === "admin"` -> admin access
- Else -> normal user access

### GET `/auth/me`
Returns current logged-in user profile.

### POST `/auth/logindata`
Compatibility alias for `/auth/me`.

---

## 2. User APIs (Auth Required)

### POST `/user/userdata`
Body:

```json
{}
```

Response:

```json
{
  "isDone": true,
  "success": true,
  "data": [
    {
      "id": "<userId>",
      "name": "John Doe",
      "username": "john",
      "email": "john@example.com",
      "phoneNo": "9876543210",
      "address": "Delhi",
      "role": "<role>"
    }
  ]
}
```

### POST `/user/updatedata` (Compatibility endpoint)
Old frontend endpoint now supported.

```json
{
  "data": {
    "name": "John Updated",
    "phoneNo": "9999999999",
    "address": "Mumbai"
  }
}
```

Also supports direct body without `data`.

### PUT `/user/edit`
Same behavior as `/user/updatedata`.

### POST `/user/changepassword`
Supports both formats:

```json
{
  "data": {
    "oldpassword": "Password@123",
    "newpassword": "NewPassword@456"
  }
}
```

or

```json
{
  "oldPassword": "Password@123",
  "newPassword": "NewPassword@456"
}
```

---

## 3. Flight APIs (Auth Required)

### POST `/flight/getflights`
Supports both filter styles.

```json
{
  "filters": {
    "routeSource": "Delhi",
    "routeDestination": "Mumbai",
    "departureDate": "2026-03-15"
  }
}
```

or

```json
{
  "filters": {
    "source": "Delhi",
    "destination": "Mumbai",
    "date": "2026-03-15"
  }
}
```

### POST `/flight/addflight`
### POST `/flight/addFlight` (compatibility alias)
Supports both project schema and guide/admin schema.

Guide style example:

```json
{
  "flightNumber": "AI103",
  "airline": "Air India",
  "source": "Delhi",
  "destination": "Bangalore",
  "departureTime": "06:00",
  "arrivalTime": "08:30",
  "duration": "2h 30m",
  "price": 4000,
  "totalSeats": 200,
  "availableSeats": 200,
  "date": "2026-03-15"
}
```

Legacy style with wrapped body also supported:

```json
{
  "data": {
    "name": "AI103",
    "routeSource": "Delhi",
    "routeDestination": "Bangalore",
    "departureDate": "2026-03-15",
    "departureTime": "06:00",
    "returnDate": "2026-03-15",
    "returnTime": "08:30",
    "flightDuration": "2h 30m",
    "isEconomyClass": true,
    "economyClassTicketCost": 4000,
    "economyClassTotalSeats": 200,
    "economyClassRemainingSeats": 200,
    "isBusinessClass": false,
    "isFirstClass": false
  }
}
```

### POST `/flight/booking/newbooking` (Crash-proof)
Now validates input safely and returns 400 JSON instead of crashing.

Supported payload 1 (legacy frontend):

```json
{
  "data": {
    "flightId": "<flightId>",
    "isEconomyClass": true,
    "economyClassTickets": 2,
    "isBusinessClass": false,
    "isFirstClass": false,
    "totalCost": 8000
  }
}
```

Supported payload 2 (guide style):

```json
{
  "flightId": "<flightId>",
  "passengers": 2,
  "passengerDetails": [
    {
      "name": "John Doe",
      "age": 30,
      "email": "john@example.com",
      "phone": "9999999999"
    }
  ]
}
```

### POST `/flight/booking/getbookings`

```json
{}
```

Returns enriched data with `bookingId`, `status`, `totalPrice`, `flightNumber`, `source`, `destination`, etc.

---

## 4. Issue APIs (Auth Required)

### POST `/issue/getissues`

```json
{}
```

- Normal user: own issues
- Admin user: all issues

### POST `/issue/addissue`
Supports all formats:

Format A (current frontend report page):

```json
{
  "issue": "My booking payment failed but amount debited"
}
```

Format B:

```json
{
  "issue": {
    "subject": "Payment Issue",
    "description": "Amount debited but booking failed",
    "issueType": "Payment"
  }
}
```

Format C:

```json
{
  "subject": "Payment Issue",
  "description": "Amount debited but booking failed",
  "issueType": "Payment"
}
```

---

## 5. Admin APIs (Auth Required + Admin Role)

All admin endpoints remain under `/admin/*`.
Now normalized for frontend admin pages:

- each record has `id`
- role normalized to `admin`/`user`
- booking status normalized to `pending`/`confirmed`/`cancelled`
- issue status normalized to `open`/`in-progress`/`resolved`/`closed`

Main endpoints:

- `POST /admin/flights/list`
- `POST /admin/flights/create`
- `PUT /admin/flights/:id`
- `DELETE /admin/flights/:id`
- `POST /admin/flights/search`

- `POST /admin/users/list`
- `POST /admin/users/create`
- `PUT /admin/users/:id`
- `DELETE /admin/users/:id`
- `POST /admin/users/search`

- `POST /admin/bookings/list`
- `POST /admin/bookings/create`
- `PUT /admin/bookings/:id` (accepts `status`, optional `totalPrice`, `numberOfPassengers`)
- `DELETE /admin/bookings/:id`
- `POST /admin/bookings/search`

- `POST /admin/issues/list`
- `POST /admin/issues/create`
- `PUT /admin/issues/:id`
- `DELETE /admin/issues/:id`
- `POST /admin/issues/search`

---

## 6. Bulk Data Seeding (Recommended for "filled" UI)

Backend now includes JSON-based seed support.

### Seed JSON file

```txt
Backend/Flight-Booking-Reservation-System-Backend-main/seed/sample-data.json
```

### Run seed (reset + refill)

From backend folder:

```bash
npm run seed
```

### Append without reset

```bash
npm run seed:append
```

### Custom file

```bash
node scripts/seed-data.js --reset --file .\seed\sample-data.json
```

---

## 7. Quick Smoke Test Order

1. Signup/Login
2. `/user/userdata`
3. `/flight/getflights`
4. `/flight/addFlight`
5. `/flight/booking/newbooking`
6. `/flight/booking/getbookings`
7. `/issue/addissue`
8. `/issue/getissues`
9. Admin list endpoints

---

## 8. Notes

- If MongoDB Atlas IP is not whitelisted, DB APIs return connection error.
- To store directly in Atlas, set `MONGODB_URL` in backend `.env` to your Atlas connection string, then restart backend.
- Admin panel CRUD now supports create/update/delete/list for flights, users, bookings and issues.
- Booking endpoint is now safe against invalid payload and will not crash server.
- Compatibility endpoints added for frontend existing calls:
  - `/user/updatedata`
  - `/user/changepassword`
  - `/auth/logindata`
  - `/issue/getissues`
  - `/issue/addissue`
  - `/flight/addFlight`
