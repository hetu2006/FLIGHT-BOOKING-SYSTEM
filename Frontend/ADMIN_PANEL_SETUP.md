# 🎯 Admin Panel Setup & Integration Guide

## ✅ What's Created

I've built a **complete professional admin panel** for your Flight Booking System with:

### 📁 Folder Structure
```
src/app/pages/admin/
├── admin-dashboard.component.ts/html/css        (Main layout with sidebar)
├── admin.module.ts                               (Admin module)
├── admin-routing.module.ts                       (Admin routes)
├── admin-dashboard.component.spec.ts             (Tests)
├── ADMIN_PANEL_README.md                         (Full documentation)
│
├── services/
│   ├── admin.service.ts                          (API service - handles all HTTP calls)
│   └── admin.service.spec.ts                     (Service tests)
│
└── pages/
    ├── admin-flights/                            (Flight Management)
    │   ├── admin-flights.component.ts
    │   ├── admin-flights.component.html
    │   ├── admin-flights.component.css
    │   └── admin-flights.component.spec.ts
    │
    ├── admin-users/                              (User Management)
    │   ├── admin-users.component.ts
    │   ├── admin-users.component.html
    │   ├── admin-users.component.css
    │   └── admin-users.component.spec.ts
    │
    ├── admin-bookings/                           (Booking Management)
    │   ├── admin-bookings.component.ts
    │   ├── admin-bookings.component.html
    │   ├── admin-bookings.component.css
    │   └── admin-bookings.component.spec.ts
    │
    └── admin-issues/                             (Issue Management)
        ├── admin-issues.component.ts
        ├── admin-issues.component.html
        ├── admin-issues.component.css
        └── admin-issues.component.spec.ts
```

## 🚀 How to Access Admin Panel

### Step 1: Start Your Application
```bash
npm start
```
App runs on: `http://localhost:4200`

### Step 2: Login
1. Go to Login page
2. Enter your credentials
3. Login successfully

### Step 3: Access Admin Panel
**Navigate to:** `http://localhost:4200/admin`

Or you can add a link in your header component:
```html
<a [routerLink]="['/admin']" *ngIf="userRole === 'admin'">Admin Panel</a>
```

## 📋 Features in Each Page

### 1️⃣ **Flights Management** (`/admin/flights`)
✨ Features:
- 🔍 **Search** flights by number, airline, source, destination
- ➕ **Add New Flight** with modal form
- ✏️ **Edit** flight details (timing, price, seats)
- 🗑️ **Delete** flights with confirmation
- 📄 **Pagination** for managing large datasets
- 📊 **Beautiful Table** showing all flight details

**Search Bar:** Top left - search in real-time
**Add Button:** Top right - "Add New Flight"
**Table Actions:** Edit and Delete icons in last column

### 2️⃣ **Users Management** (`/admin/users`)
✨ Features:
- 🔍 **Search** users by username, name, email
- ✏️ **Edit** user details and assign roles (Admin/User)
- 🗑️ **Delete** user accounts
- 📄 **Pagination** for user lists
- 👥 **User Info** displayed with role badges

**Search Bar:** Top left - search users
**Table Actions:** Edit and Delete icons available

### 3️⃣ **Bookings Management** (`/admin/bookings`)
✨ Features:
- 🔍 **Search** bookings by ID, user, or flight
- ✏️ **Edit** booking status (Pending, Confirmed, Cancelled)
- 🗑️ **Delete** booking records
- 📄 **Pagination** for handling many bookings
- 💰 **Price Display** with Euro currency
- 👥 **Passenger Count** shown clearly

**Search Bar:** Top left - search bookings
**Table Actions:** Edit and Delete options available

### 4️⃣ **Issues Management** (`/admin/issues`)
✨ Features:
- 🔍 **Search** issues by subject or user
- ✏️ **Edit** status and add resolution notes
- 🗑️ **Delete** closed/resolved issues
- 📄 **Pagination** for issue lists
- 📝 **Status Tracking** (Open, In Progress, Resolved, Closed)
- 📋 **Issue Description** preview in table

**Search Bar:** Top left - search issues
**Table Actions:** Edit and Delete icons in last column

## 🛠️ API Integration

### Backend Endpoints Required

Your backend needs to implement these endpoints. Update your server code with these:

#### Flights Endpoints
```
POST   /api/admin/flights/list           (Get paginated flights)
POST   /api/admin/flights/search         (Search flights)
POST   /api/admin/flights/create         (Create new flight)
GET    /api/admin/flights/{id}           (Get single flight)
PUT    /api/admin/flights/{id}           (Update flight)
DELETE /api/admin/flights/{id}           (Delete flight)
```

#### Users Endpoints
```
POST   /api/admin/users/list             (Get paginated users)
POST   /api/admin/users/search           (Search users)
GET    /api/admin/users/{id}             (Get single user)
PUT    /api/admin/users/{id}             (Update user)
DELETE /api/admin/users/{id}             (Delete user)
```

#### Bookings Endpoints
```
POST   /api/admin/bookings/list          (Get paginated bookings)
POST   /api/admin/bookings/search        (Search bookings)
GET    /api/admin/bookings/{id}          (Get single booking)
PUT    /api/admin/bookings/{id}          (Update booking)
DELETE /api/admin/bookings/{id}          (Delete booking)
```

#### Issues Endpoints
```
POST   /api/admin/issues/list            (Get paginated issues)
POST   /api/admin/issues/search          (Search issues)
GET    /api/admin/issues/{id}            (Get single issue)
PUT    /api/admin/issues/{id}            (Update issue)
DELETE /api/admin/issues/{id}            (Delete issue)
```

### Request/Response Format

**Expected Response Format:**
```json
{
  "data": [
    { /* item 1 */ },
    { /* item 2 */ }
  ],
  "total": 100
}
```

**Headers Sent:**
```
Authorization: d8c03b5e-29aa-4708-b55d-5d32b2a7295b [token]
```

## 🎨 Design Features

### Visual Elements
- **Gradient Sidebar:** Purple to Pink gradient navigation
- **Smooth Animations:** Fade-in effects for content
- **Responsive Tables:** Professional striped design
- **Color-Coded Badges:** Status indicators
- **Loading Spinner:** CSS-based rotating animation
- **Hover Effects:** Interactive row highlighting

### Layout
- **Sidebar Left:** Navigation menu (collapsible on mobile)
- **Top Header:** Title and user info
- **Main Content:** Flexible area for page content
- **Pagination:** Bottom of tables (if multiple pages)
- **Search Bar:** Top of data tables
- **Action Buttons:** Edit/Delete in table rows

### Responsive
- ✅ Desktop: Full sidebar + content
- ✅ Tablet: Collapsible sidebar
- ✅ Mobile: Mobile-friendly card layout

## 🔧 Configuration

### If You Need to Change API Path
Edit: `src/app/constants/IMPData.ts`
```typescript
export const API_PATH = 'http://localhost:3001'; // Change this if needed
```

### If You Need to Customize Dialog/Modal
Edit individual component files in:
- `src/app/pages/admin/pages/admin-*/admin-*.component.html`

### If You Need to Add More Permissions
Edit: `src/app/pages/admin/admin-dashboard.component.ts`
```typescript
logoutAdmin(): void {
  // Add additional checks or permissions here
}
```

## 📝 Implementation Checklist

- ✅ Admin folder structure created
- ✅ Sidebar and dashboard layout completed
- ✅ All 4 management pages created (Flights, Users, Bookings, Issues)
- ✅ Search functionality on all pages
- ✅ Edit/Delete buttons with modals
- ✅ Pagination system
- ✅ API service with all endpoints
- ✅ Beautiful animations and styling
- ✅ Responsive mobile design
- ✅ Module and routing setup
- ✅ Integrated into main app routing

## ⚠️ Important Notes

1. **Token Required:** User must be logged in to access admin panel
2. **Authorization Header:** All API calls include token from localStorage
3. **Admin Role Check:** Make sure your backend verifies admin role (optional to add in future)
4. **API Path:** Verify `http://localhost:3001` is your backend URL
5. **CORS:** Ensure backend allows requests from `http://localhost:4200`

## 🎓 Next Steps

### Option 1: Quickly Test
1. Start the app: `npm start`
2. Login with your account
3. Go to `/admin`
4. Try adding/editing/deleting items
5. Check network tab in DevTools to see API calls

### Option 2: Implement Backend Endpoints
1. Create the API endpoints in your backend server
2. Return data in the format shown above
3. Test with Postman first
4. Then test through admin panel

### Option 3: Customize Further
1. Add icons from FontAwesome in sidebar
2. Add dashboard stats page
3. Add advanced filters
4. Add bulk actions
5. Export to CSV feature

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Admin page blank | Check if user is logged in (token in localStorage) |
| Tables empty | Verify backend endpoints are implemented |
| Search not working | Check if `/search` endpoint is available |
| Styling issues | Clear cache: `Ctrl+Shift+Delete` then reload |
| 404 errors | Verify `API_PATH` in `IMPData.ts` matches your backend |
| Modal not closing | Check browser console for JavaScript errors |

## 📚 Additional Resources

- **Full Documentation:** [ADMIN_PANEL_README.md](./ADMIN_PANEL_README.md)
- **Admin Service:** `src/app/pages/admin/services/admin.service.ts`
- **Sample Flight Component:** `src/app/pages/admin/pages/admin-flights/`

## 💬 Quick Tips

✨ **Best Practices:**
- Always implement pagination on backend (10-50 items per page)
- Return total count for accurate pagination
- Validate user role on backend before modifying data
- Log all admin activities for audit trail
- Add input validation in forms
- Use loading spinners for better UX
- Add success/error toast notifications

🎯 **Future Enhancements:**
- Dashboard with statistics
- Advanced filters and sorting
- Bulk select and delete
- Export to PDF/Excel
- Activity logs
- User permissions management
- API rate limiting display

---

**Setup Complete! 🎉 Your admin panel is ready to use.**

Navigate to `http://localhost:4200/admin` after logging in!
