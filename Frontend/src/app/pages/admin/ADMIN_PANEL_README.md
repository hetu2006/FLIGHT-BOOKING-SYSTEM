# Flight Booking Admin Panel

## Overview
The Admin Panel is a comprehensive management system for administrating the Flight Booking Reservation System. It provides full CRUD (Create, Read, Update, Delete) operations for flights, users, bookings, and issues.

## Path to Access Admin Panel
```
Navigate to: http://localhost:4200/admin
```

## Features

### 1. **Responsive Layout**
- **Sidebar Navigation**: Collapsible sidebar on the left for easy navigation
- **Top Header**: Display admin information and logout option
- **Main Content Area**: Dynamic content area showing selected page
- **Smooth Animations**: All transitions have smooth fade-in and slide-up animations
- **Mobile Responsive**: Fully responsive design for tablet and mobile devices

### 2. **Flights Management** (`/admin/flights`)
- View all flights with pagination
- **Search Functionality**: Search flights by flight number, airline, source, or destination
- **Add New Flight**: Modal form to add new flights
- **Edit Flight**: Update flight details (timing, price, seat availability)
- **Delete Flight**: Remove flights from the system
- **Pagination**: Manage large datasets with pagination controls
- **Table Display**: Shows flight number, airline, route, departure/arrival times, price, and available seats

**API Endpoints Used:**
- GET `/api/admin/flights/list` - Get paginated flights
- POST `/api/admin/flights/search` - Search flights
- POST `/api/admin/flights/create` - Create new flight
- PUT `/api/admin/flights/{id}` - Update flight
- DELETE `/api/admin/flights/{id}` - Delete flight

### 3. **Users Management** (`/admin/users`)
- View all registered users
- **Search Functionality**: Search by username, name, or email
- **Edit User**: Modify user details (name, email, phone, role)
- **Delete User**: Remove users from the system
- **Pagination**: Manage large user lists efficiently
- **Role Management**: Assign admin or user roles
- **Table Display**: Shows username, name, email, phone, role, and join date

**API Endpoints Used:**
- GET `/api/admin/users/list` - Get paginated users
- POST `/api/admin/users/search` - Search users
- PUT `/api/admin/users/{id}` - Update user
- DELETE `/api/admin/users/{id}` - Delete user

### 4. **Bookings Management** (`/admin/bookings`)
- View all flight bookings
- **Search Functionality**: Search by booking ID, user, or flight
- **Edit Booking**: Modify booking status and details
- **Delete Booking**: Cancel/remove bookings
- **Pagination**: Handle large booking datasets
- **Status Management**: Change booking status (Pending, Confirmed, Cancelled)
- **Table Display**: Shows booking details, passenger count, price, and status

**API Endpoints Used:**
- GET `/api/admin/bookings/list` - Get paginated bookings
- POST `/api/admin/bookings/search` - Search bookings
- PUT `/api/admin/bookings/{id}` - Update booking
- DELETE `/api/admin/bookings/{id}` - Delete booking

### 5. **Issues Management** (`/admin/issues`)
- View all reported issues
- **Search Functionality**: Search by subject or user
- **Edit Issue**: Update issue status and add resolution notes
- **Delete Issue**: Remove resolved or irrelevant issues
- **Pagination**: Manage issues efficiently
- **Status Tracking**: Track issue status (Open, In Progress, Resolved, Closed)
- **Table Display**: Shows issue details, status, and reporting date

**API Endpoints Used:**
- GET `/api/admin/issues/list` - Get paginated issues
- POST `/api/admin/issues/search` - Search issues
- PUT `/api/admin/issues/{id}` - Update issue
- DELETE `/api/admin/issues/{id}` - Delete issue

## UI Components

### Search Bar (Left Side)
- Positioned at the top of each management page
- Real-time search filtering
- Placeholder text guides users on what they can search for
- Font Awesome search icon for visual clarity

### Add New Button (Top Right)
- Available on the Flights page for quick access to add new flights
- Hover effects and smooth animations
- Opens a modal dialog for data entry

### Edit & Delete Buttons (Table)
- Edit Icon: Click to open edit modal with pre-filled data
- Delete Icon: Click to delete with confirmation dialog
- Color-coded: Edit (blue), Delete (red)
- Hover effects for better UX

### Tables
- **Striped Rows**: Alternate row colors for better readability
- **Hover Effect**: Rows highlight on hover
- **Fixed Headers**: Column headers remain visible while scrolling
- **Gradient Header**: Beautiful gradient background (purple to pink)
- **Responsive**: Tables adapt to mobile screens with card layout

### Pagination
- **Previous/Next Buttons**: Navigation between pages
- **Page Numbers**: Shows current position and quick page selection
- **Smart Display**: Shows only 5 pages at a time for clarity
- **Disabled State**: Previous button disabled on first page, Next on last page

### Modal Dialogs
- **Add/Edit Forms**: Clean form layouts with validation
- **Close Button**: X icon in top right for easy closing
- **Cancel & Save**: Clear action buttons
- **Gradient Header**: Matches admin theme
- **Smooth Animation**: Slide-in effect when opening

### Loading State
- **Spinner Animation**: CSS-based rotating spinner
- **Loading Message**: "Loading [resource]..." text
- **Full Height**: Centered in the page for visibility

### No Data State
- **Icon Display**: Large inbox icon
- **Message**: "No [resource] found"
- **Useful**: Helps users understand empty states

## Styling & Design

### Color Scheme
- **Primary Gradient**: Purple (#667eea) to Pink (#764ba2)
- **Success**: Green (#388e3c)
- **Warning**: Orange (#e65100)
- **Danger**: Red (#c62828)
- **Info**: Blue (#1976d2)
- **Background**: Light gray (#f5f6fa)
- **Text**: Dark gray (#2c3e50)

### Typography
- **Font Family**: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif
- **Headings**: Bold, large, dark color
- **Body**: Regular weight, readable size
- **Labels**: Medium weight, clear hierarchy

### Spacing & Layout
- **Padding**: Consistent 20-30px for sections
- **Gaps**: 10-25px between elements
- **Border Radius**: 6-8px for modern look
- **Box Shadows**: Subtle shadows for depth

## Authentication & Security
- **Token-Based Auth**: JWT token from localStorage
- **Headers**: All API calls include authorization header with token prefix
- **Guard Protection**: Routes protected by UserLoginGuard
- **Logout**: Admin can logout and clear session data

## How to Use

### Accessing Admin Panel
1. Login to your account
2. Navigate to `/admin` in the URL bar
3. You'll see the admin dashboard with sidebar

### Navigating Between Pages
1. Click menu items in sidebar (Flights, Users, Bookings, Issues)
2. Content loads dynamically on the right side
3. Sidebar collapses on mobile for better space

### Managing Flights
1. Go to Flights page
2. See all flights in table with pagination
3. **Search**: Type in search box to filter flights
4. **Add**: Click "Add New Flight" button to create
5. **Edit**: Click edit icon to modify flight details
6. **Delete**: Click delete icon with confirmation

### Managing Users
1. Go to Users page
2. View all registered users
3. **Search**: Type to find specific users
4. **Edit**: Click edit icon to change user role or details
5. **Delete**: Click delete icon to remove user

### Managing Bookings
1. Go to Bookings page
2. View all bookings with passenger count and price
3. **Search**: Find bookings by ID, user, or flight
4. **Edit**: Update status (Pending/Confirmed/Cancelled)
5. **Delete**: Remove booking records

### Managing Issues
1. Go to Issues page
2. View reported issues with status
3. **Search**: Find issues by subject or user
4. **Edit**: Update status and add resolution notes
5. **Delete**: Remove closed issues

## Backend API Requirements

Ensure your backend server has these endpoints implemented:

```
Flights:
- POST /api/admin/flights/list
- POST /api/admin/flights/search
- POST /api/admin/flights/create
- GET /api/admin/flights/{id}
- PUT /api/admin/flights/{id}
- DELETE /api/admin/flights/{id}

Users:
- POST /api/admin/users/list
- POST /api/admin/users/search
- GET /api/admin/users/{id}
- PUT /api/admin/users/{id}
- DELETE /api/admin/users/{id}

Bookings:
- POST /api/admin/bookings/list
- POST /api/admin/bookings/search
- GET /api/admin/bookings/{id}
- PUT /api/admin/bookings/{id}
- DELETE /api/admin/bookings/{id}

Issues:
- POST /api/admin/issues/list
- POST /api/admin/issues/search
- GET /api/admin/issues/{id}
- PUT /api/admin/issues/{id}
- DELETE /api/admin/issues/{id}
```

## File Structure

```
src/app/pages/admin/
├── admin-dashboard.component.ts (Main container)
├── admin-dashboard.component.html (Layout with sidebar)
├── admin-dashboard.component.css (Global admin styles)
├── admin.module.ts (Admin module)
├── admin-routing.module.ts (Admin routes)
├── services/
│   └── admin.service.ts (API service)
└── pages/
    ├── admin-flights/
    │   ├── admin-flights.component.ts
    │   ├── admin-flights.component.html
    │   └── admin-flights.component.css
    ├── admin-users/
    │   ├── admin-users.component.ts
    │   ├── admin-users.component.html
    │   └── admin-users.component.css
    ├── admin-bookings/
    │   ├── admin-bookings.component.ts
    │   ├── admin-bookings.component.html
    │   └── admin-bookings.component.css
    └── admin-issues/
        ├── admin-issues.component.ts
        ├── admin-issues.component.html
        └── admin-issues.component.css
```

## Animations

All components feature smooth animations:
- **Fade In**: Components fade in smoothly
- **Slide Up**: Tables and content slide up on load
- **Scale on Hover**: Rows scale slightly on hover
- **Smooth Transitions**: All hover effects have smooth transitions
- **Spinner**: Rotating CSS-based spinner for loading states

## Responsive Design

The admin panel is fully responsive:
- **Desktop**: Full layout with sidebar on the left
- **Tablet**: Sidebar can be toggled, content takes more space
- **Mobile**: Collapsible sidebar, card-based table layout

## Future Enhancements

Potential features to add:
- Dashboard with statistics and charts
- Bulk actions (select multiple items)
- Advanced filters and sorting
- Export data to CSV/PDF
- Activity logs and audit trails
- Notification system
- User roles and permissions
- API rate limiting controls
- Database backup management

## Troubleshooting

1. **Admin page shows blank**: Check if token exists in localStorage
2. **Tables not loading**: Verify backend API endpoints are implemented
3. **Search not working**: Ensure backend search endpoints are functional
4. **Styling issues**: Clear browser cache and rebuild the project

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify API endpoints are correct
3. Ensure token is valid and not expired
4. Check network tab in DevTools for failed requests
