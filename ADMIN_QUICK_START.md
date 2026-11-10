# Admin Dashboard - Quick Reference Guide

## 🔐 LOGIN CREDENTIALS
```
Email: admin@marketplace.com
Password: admin123
```

## 🌐 URLs
| Feature | URL |
|---------|-----|
| Login | http://localhost:5173/login |
| Admin Dashboard | http://localhost:5173/admin |
| Providers | http://localhost:5173/admin/providers |
| Customers | http://localhost:5173/admin/customers |
| Bookings | http://localhost:5173/admin/bookings |
| Categories | http://localhost:5173/admin/categories |
| Reviews | http://localhost:5173/admin/reviews |
| Analytics | http://localhost:5173/admin/analytics |
| Activity Logs | http://localhost:5173/admin/logs |

## 📋 FEATURES CHECKLIST

### 1. Dashboard Home ✅
- Displays key stats (Providers, Customers, Bookings, Pending)
- Shows recent bookings list
- Shows top providers ranking
- All data real-time from API

### 2. Providers Management ✅
- View all providers
- Deactivate/Activate providers
- See rating and booking count
- View approval status

### 3. Customers Management ✅
- View all customers
- Activate/Deactivate customers
- See booking count
- View email and phone

### 4. Bookings Management ✅ ⭐ NEW
- View all bookings
- Filter by status (All, Pending, Approved, In Progress, Completed, Rejected)
- **Status dropdown selector** - Click to change booking status
- See customer, provider, service, and date details
- Real-time status updates with activity logging

### 5. Categories Management ✅
- View all categories
- Add new categories (name + description)
- Delete categories
- Auto-slug generation

### 6. Reviews Moderation ✅
- View all reviews
- See rating and comment
- Delete reviews
- Track moderation activities

### 7. Analytics Dashboard ✅
- Total Bookings count
- Completed Bookings count
- Total Revenue (sum of completed bookings)
- Total Commission (10%)
- Bookings by Suburb chart
- Top Services list
- Most Viewed Providers table

### 8. Activity Logs ✅
- System-wide activity tracking
- See who did what and when
- Timestamps in en-AU format
- Last 100 activity records

## 🔧 API ENDPOINTS

All endpoints require JWT token in `Authorization: Bearer {token}` header

### Dashboard
```
GET /api/admin/dashboard
```

### Providers
```
GET /api/admin/providers
PATCH /api/admin/providers/:id/deactivate
```

### Customers
```
GET /api/admin/customers
PATCH /api/admin/customers/:id/status
```

### Bookings
```
GET /api/admin/bookings?status=pending  (optional filter)
PATCH /api/admin/bookings/:id/status    (NEW - with dropdown)
```

### Categories
```
GET /api/admin/categories
POST /api/admin/categories
DELETE /api/admin/categories/:id
```

### Reviews
```
GET /api/admin/reviews
DELETE /api/admin/reviews/:id
```

### Analytics
```
GET /api/admin/analytics
```

### Activity Logs
```
GET /api/admin/activity-logs
```

## 🎨 UI FEATURES

### Modern Design
- Clean gradient backgrounds
- Professional card layouts
- Responsive tables
- Status-coded color badges
- Icons for visual clarity
- Hover states and transitions

### User Experience
- Loading indicators for async operations
- Error handling and alerts
- Success notifications
- Empty state messages
- Smooth transitions
- Mobile responsive design

### Data Display
- Tables with proper formatting
- Date/time in en-AU locale format
- Numbers with proper formatting
- Truncated text with hover preview
- Status dropdowns for editing
- Filter buttons for quick access

## 📊 DATABASE OPERATIONS

All admin operations are logged to `activity_logs` table:
- Action (what happened)
- Entity Type (what was affected)
- Entity ID (which record)
- Details (additional info)
- Admin User ID (who did it)
- Timestamp (when it happened)

## 🚀 GETTING STARTED

### Start Backend Server
```bash
cd server
npm install
npm run dev
```
Backend runs on `http://localhost:5000`

### Start Frontend Dev Server
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### Access Admin Panel
1. Go to `http://localhost:5173/login`
2. Enter admin credentials
3. Click "Log in"
4. You're now on the admin dashboard at `/admin`

## 📝 COMMON TASKS

### Change Booking Status
1. Click "Bookings" in navigation
2. Find the booking you want to update
3. Click the status dropdown (shows current status)
4. Select new status: Pending, Approved, In Progress, Completed, or Cancelled
5. Status updates immediately
6. Activity log automatically recorded

### Add New Category
1. Click "Categories" in navigation
2. Fill in "Category Name" and "Description"
3. Click "Add Category"
4. New category appears in table below
5. Activity logged automatically

### Delete Category
1. Click "Categories" in navigation
2. Find the category to delete
3. Click "Delete" button
4. Category removed from system
5. Activity logged automatically

### Deactivate Provider
1. Click "Providers" in navigation
2. Find the provider to deactivate
3. Click "Deactivate" button
4. Provider status changes to Inactive
5. Activity logged automatically
6. Click "Activate" to re-enable

### View Analytics
1. Click "Analytics" in navigation
2. See key metrics at the top
3. Scroll to see:
   - Bookings by Suburb chart
   - Top Services list
   - Most Viewed Providers table
4. Data updates in real-time

### Check Activity Log
1. Click "Logs" in navigation
2. View all system activities
3. See who did what, when
4. Timestamps are Australia/Sydney time
5. Shows all admin operations

## ⚙️ CONFIGURATION

### Database Connection
Edit `server/config/database.js` for PostgreSQL settings:
- Host: localhost
- Port: 5432
- User: your_user
- Password: your_password
- Database: marketplace_db

### Server Port
Default: 5000
Edit in `server/server.js` or set `PORT` environment variable

### Frontend Port
Default: 5173
Edit in `client/vite.config.js`

## 🔒 SECURITY NOTES

- All admin routes require valid JWT token
- All admin routes require admin role
- Passwords are hashed with bcryptjs (10 salt rounds)
- Activity is logged for audit trail
- Sensitive operations are protected
- CORS configured for local development

## 🐛 TROUBLESHOOTING

### "Cannot GET /api/admin/..."
- Backend might not be running
- Check `http://localhost:5000` is accessible
- Check API endpoint path is correct
- Review network tab in browser DevTools

### Login fails with correct credentials
- Check database is initialized
- Run `npm run init-db` in server folder
- Verify PostgreSQL is running
- Check connection string in database.js

### Page not loading/showing "Loading..."
- Check browser console for errors
- Verify API is returning data
- Check Authorization header in Network tab
- Ensure JWT token is valid

### Dropdown not working in Bookings
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check backend endpoint exists
- Verify booking status values are valid

## 📞 HELP & SUPPORT

For issues or questions:
1. Check browser console (F12) for errors
2. Check Network tab (DevTools) for API responses
3. Verify backend is running (`npm run dev` in server folder)
4. Check database connection
5. Review error messages in modal/alert boxes

---

**Status:** ✅ Admin Dashboard Fully Operational  
**Last Updated:** Current Session  
**Version:** 1.0 Complete
