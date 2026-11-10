# 🔧 BOOKING ERROR - Troubleshooting Guide

## Error You're Seeing
```
"Error creating booking: Server error"
```

## What Was Improved
✅ Enhanced error messages in backend to show actual error details  
✅ Added validation in frontend to catch missing fields  
✅ Better error handling in booking function  
✅ Added console logging for debugging  

---

## 🔍 Step-by-Step Debugging

### Step 1: Check if You're Logged In
**The booking endpoint requires authentication!**

```
1. Check if you're logged in as a CUSTOMER
2. Look at browser console (F12)
3. Check if you see user in localStorage
4. If not logged in, you'll get "Server error"
```

**Solution:**
```
If not logged in:
1. Go to /login (or /register)
2. Create a customer account
3. Login as customer
4. Try booking again
```

### Step 2: Check Browser Console for Detailed Error
```
1. Press F12 to open Developer Tools
2. Click "Console" tab
3. Try to create a booking
4. Look for error message (now more detailed)
5. Screenshot or copy the full error
```

**Expected errors and solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required fields" | Form fields empty | Fill all fields: Name, Email, Address, Suburb, Date |
| "Provider not found" | Invalid provider ID | Make sure provider exists in database |
| "Service not found" | Invalid service ID | Make sure service exists for this provider |
| "Server error" | Database connection issue | Check if backend is running |

### Step 3: Check Network Tab
```
1. Press F12
2. Go to "Network" tab
3. Try to create a booking
4. Find request: POST /api/customer/bookings
5. Click on it
6. Check:
   - Request body (what you sent)
   - Response body (what server returned)
   - Status code (should be 201 if success)
```

### Step 4: Verify Backend is Running
```
In terminal:
cd server
npm run dev

Should show:
✅ Server running on port 5000
✅ Database connected

If not:
❌ Backend not running = all API requests fail
```

### Step 5: Check Booking Form Data
```
Make sure you filled in:
[ ] Your Name - Required
[ ] Email - Required
[ ] Phone - Should have value
[ ] Service Address - Required
[ ] Suburb - Required
[ ] Booking Date - Required (must select date)
[ ] Booking Time - Optional but good to have
[ ] Additional Notes - Optional
```

---

## 🔑 Common Issues & Solutions

### Issue 1: "You must login to book"
**Problem:** Not authenticated  
**Solution:** Login as customer first at `/login`

### Issue 2: "Only customers can book services"
**Problem:** Logged in as Provider or Admin, not Customer  
**Solution:** Logout and login as a Customer account

### Issue 3: "Please fill in all required fields"
**Problem:** Form validation failed  
**Solution:** 
```
Check these fields are filled:
✓ Your Name
✓ Email
✓ Service Address
✓ Suburb
✓ Booking Date (must pick a date)
```

### Issue 4: "Error creating booking: Server error"
**Problem:** Backend returned generic error  
**Solution:**
```
1. Check browser console (F12) for detailed error
2. Check Network tab to see response details
3. Make sure backend is running: npm run dev
4. Check database is connected
5. Verify provider ID exists in database
```

### Issue 5: Booking succeeds but page doesn't redirect
**Problem:** Navigation didn't work  
**Solution:**
```
1. The booking was created successfully
2. Manually go to /customer to see your bookings
3. Check if you see the booking in the list
```

---

## 🧪 Test Procedure

### To Test Booking Successfully:

**Step 1: Ensure Backend is Running**
```
Terminal: cd server && npm run dev
Should show: "Server running on port 5000"
```

**Step 2: Ensure Frontend is Running**
```
Terminal: cd client && npm run dev
Should show: "VITE ready at http://localhost:5173"
```

**Step 3: Create Customer Account**
```
Go to: http://localhost:5173/register
Fill in:
  - First Name: John
  - Last Name: Doe
  - Email: john@example.com
  - Phone: 9876543210
  - Password: test123
  - Account Type: Customer
Click "Register"
```

**Step 4: Login as Customer**
```
Go to: http://localhost:5173/login
Email: john@example.com
Password: test123
Click "Log in"
```

**Step 5: Search for Provider**
```
Click "Search Providers" or go to /search
Find a provider
Click on provider card to view details
```

**Step 6: Try Booking**
```
Click "Book Now" on a service
Fill form completely:
  - Name: John Doe
  - Email: john@example.com
  - Phone: 9876543210
  - Address: 123 Main St
  - Suburb: Melbourne
  - Date: Pick today or future date
  - Time: (optional) Pick a time
  - Notes: (optional) Any notes
Click "Confirm Booking"
```

**Expected Result:**
```
✅ Success message
✅ Redirected to /customer
✅ Booking appears in your booking list
```

---

## 📊 Debugging with Console Logs

### Check What Data is Being Sent:
```javascript
// In browser console, when submitting form:
// Look for: "Booking error: ..."
// This will show the exact error from backend
```

### Check Backend Logs:
```
In terminal where backend is running (npm run dev):
Look for:
  "Create booking error: ..." - Shows what went wrong
  
If you see the error message, note it down.
```

---

## 🔐 Authentication Check

### Verify You Have Valid JWT Token:

```
1. Open browser console (F12)
2. Type: localStorage.getItem('token')
3. If it returns null: You're not logged in
4. If it returns a long string: You have token
5. Try booking again
```

### Verify Token is Being Sent:

```
1. Open Network tab (F12)
2. Try to create booking
3. Find request: POST /api/customer/bookings
4. Click on it
5. Go to "Headers" tab
6. Look for: Authorization: Bearer [token]
7. If it's there: Auth is working
8. If missing: Check axios configuration in AuthContext.jsx
```

---

## 🛠️ If Issue Persists

**Collect this information:**
1. Screenshot of error message
2. Browser console error (from F12 → Console tab)
3. Network response body (from F12 → Network tab → booking request)
4. Backend server logs (from terminal)
5. Whether you're logged in as customer
6. What browser you're using

**Then:**
1. Check if provider exists in admin panel
2. Check if provider has services
3. Try booking from a different provider
4. Try with different date/time values
5. Check database directly for booking records

---

## ✨ Recent Improvements

**Backend Changes:**
- ✅ Better error messages (now returns error.message)
- ✅ Field validation before DB insert
- ✅ Safe provider notification (checks if provider exists)
- ✅ Default status set to 'pending'

**Frontend Changes:**
- ✅ Form field validation before submit
- ✅ Better error message display
- ✅ Console logging for debugging
- ✅ Form reset after successful booking
- ✅ Navigate to /customer dashboard after booking

---

## 📞 Quick Checklist

Before reporting the issue, verify:
- [ ] Backend is running (npm run dev in server folder)
- [ ] Frontend is running (npm run dev in client folder)
- [ ] You're logged in as a CUSTOMER (not admin/provider)
- [ ] You filled all required form fields
- [ ] You selected a booking date
- [ ] The provider exists (you can see their details page)
- [ ] The service exists (you can see the price)
- [ ] Check browser console (F12) for actual error message

---

**The booking system should now give you a detailed error message instead of just "Server error". Check your browser console for the specific issue!**
