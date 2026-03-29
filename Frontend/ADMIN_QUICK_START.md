# 🚀 Admin Panel - Quick Start

## Access Admin Panel
```
http://localhost:4200/admin
```
(Must be logged in as user)

## Sidebar Navigation
- **Flights** - Manage all flights
- **Users** - Manage registered users
- **Bookings** - Manage flight bookings
- **Issues** - Manage reported issues
- **Logout** - Exit admin panel

---

## 📊 Page Features at a Glance

### Flights Page
| Feature | How to Use |
|---------|-----------|
| Search | Type flight number, airline, source, destination in search box |
| Add Flight | Click "Add New Flight" button (top right) |
| Edit | Click blue ✏️ icon in table row |
| Delete | Click red 🗑️ icon in table row |
| Pagination | Use Previous/Next buttons or click page numbers |

### Users Page
| Feature | How to Use |
|---------|-----------|
| Search | Type username, name, or email in search box |
| Edit User | Click ✏️ icon to change name, email, phone, role |
| Delete | Click 🗑️ icon to remove user |
| Pagination | Navigate with Previous/Next buttons |

### Bookings Page
| Feature | How to Use |
|---------|-----------|
| Search | Type booking ID, user, or flight number |
| Edit Status | Click ✏️ icon to change status (Pending/Confirmed/Cancelled) |
| Delete Booking | Click 🗑️ icon to remove booking |
| View Details | See passenger count and total price in table |

### Issues Page
| Feature | How to Use |
|---------|-----------|
| Search | Type issue subject or username |
| Update Status | Click ✏️ icon to change status and add notes |
| Delete | Click 🗑️ icon to remove issue |
| See Description | Hover over description for full text |

---

## 🎯 Table Layout (All Pages)

```
┌─────────────────────────────────────────────────────────┐
│  [Search Icon] Search box...                      [+Add] │
├─────────────────────────────────────────────────────────┤
│  ID    | Name        | Status    | Date       | [Actions]│
│        |             |           |            | Edit Del │
├─────────────────────────────────────────────────────────┤
│        |             |           |            | ✏️  🗑️   │
│        |             |           |            | ✏️  🗑️   │
│        |             |           |            | ✏️  🗑️   │
├─────────────────────────────────────────────────────────┤
│ [Prev] [1] [2] [3] [Next] ............................ 100│
└─────────────────────────────────────────────────────────┘
```

---

## 📍 File Locations

```
src/app/pages/admin/

Main Files:
├── admin-dashboard.component.ts (Main container)
├── admin.module.ts (Setup)
├── admin-routing.module.ts (Routes)
└── services/admin.service.ts (API calls)

Pages:
├── pages/admin-flights/
├── pages/admin-users/
├── pages/admin-bookings/
└── pages/admin-issues/
```

---

## API Endpoints Your Backend Needs

### Flights
```
POST   /api/admin/flights/list
POST   /api/admin/flights/search
POST   /api/admin/flights/create
PUT    /api/admin/flights/{id}
DELETE /api/admin/flights/{id}
```

### Users
```
POST   /api/admin/users/list
POST   /api/admin/users/search
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
```

### Bookings
```
POST   /api/admin/bookings/list
POST   /api/admin/bookings/search
PUT    /api/admin/bookings/{id}
DELETE /api/admin/bookings/{id}
```

### Issues
```
POST   /api/admin/issues/list
POST   /api/admin/issues/search
PUT    /api/admin/issues/{id}
DELETE /api/admin/issues/{id}
```

---

## ✨ Design Features

✅ **Sidebar** - Purple gradient, collapsible
✅ **Search** - Real-time filtering on all pages
✅ **Pagination** - Smart page navigation
✅ **Modals** - Clean edit/add dialogs
✅ **Animations** - Smooth fade-in effects
✅ **Responsive** - Works on all devices
✅ **Badges** - Color-coded status indicators
✅ **Loading** - Spinner while fetching data

---

## Colors Used

- **Primary:** Purple → Pink gradient (#667eea → #764ba2)
- **Success:** Green (#388e3c)
- **Warning:** Orange (#e65100)
- **Danger:** Red (#c62828)
- **Info:** Blue (#1976d2)
- **Background:** Light gray (#f5f6fa)

---

## Quick Customization

**Change API URL:**
`src/app/constants/IMPData.ts`
```typescript
export const API_PATH = 'http://your-server:port';
```

**Change Colors:**
Edit `admin-dashboard.component.css` gradient colors

**Add New Page:**
1. Create folder in `pages/`
2. Add component files
3. Update `admin-routing.module.ts`
4. Add menu item in dashboard HTML

---

## Common Tasks

### Delete an Item
1. Hover over table row
2. Click red 🗑️ icon
3. Confirm deletion
4. Item removed from list

### Edit an Item
1. Click blue ✏️ icon
2. Modal opens with current data
3. Make changes
4. Click "Update"
5. Changes saved

### Search
1. Click search box
2. Type search term (real-time filter)
3. Results update instantly
4. Clear to see all items

### Navigate Pages
1. If data has multiple pages:
   - Use [Prev] [1] [2] [3] [Next] buttons
   - Click page number to jump directly
   - Previous button disabled on page 1
   - Next button disabled on last page

---

## Need Help?

📖 **Full Documentation:** See [ADMIN_PANEL_README.md](./src/app/pages/admin/ADMIN_PANEL_README.md)

🐛 **Issue:** Admin panel showing blank
➡️ **Fix:** Make sure you're logged in

🐛 **Issue:** Tables not loading
➡️ **Fix:** Check if backend endpoints exist and return correct format

🐛 **Issue:** API calls not working
➡️ **Fix:** Verify `API_PATH` and check CORS is enabled

---

**Version:** 1.0
**Status:** ✅ Production Ready
**Last Updated:** March 2026
