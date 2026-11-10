# Customer Portal - Quick Reference Guide

## 📍 Pages Overview

### 1. Home Page (`/`)
- Landing page with navigation
- Quick links to search and login
- Information about the platform

### 2. Search Providers Page (`/search`)
- **URL**: `http://localhost:5173/search`
- **Access**: Public (no login required)
- **Purpose**: Browse and search for service providers

#### Features:
- **Search Filters**:
  - Provider/Service name search
  - Category dropdown
  - Suburb search
  - Specialties search
  - Minimum rating filter
  - Clear Filters button

- **View Modes**:
  - **Grid View**: 3-column card layout (default)
  - **List View**: Horizontal card layout
  
- **Results Display**:
  - Business name
  - Rating stars + review count
  - Location info
  - Booking history
  - "View Details & Book" button

---

### 3. Provider Details Page (`/providers/:id`)
- **URL**: `http://localhost:5173/providers/1` (example)
- **Access**: Public, can book after login as customer
- **Purpose**: View detailed provider info and book services

#### Sections:
1. **Provider Header**:
   - Business name
   - Rating display
   - Contact details (phone, email, address)
   - About description

2. **Services Grid**:
   - Service name, category, price
   - Duration, description
   - "Book Now" button per service

3. **Customer Reviews**:
   - Reviewer name and date
   - Star rating display
   - Review comment
   - Provider response section

#### Booking Modal:
- Opens when clicking "Book Now"
- Form fields:
  - Booking Date (date picker)
  - Preferred Time (time input)
  - Customer Name (text)
  - Phone (tel)
  - Email (email)
  - Service Address (text)
  - Suburb (text)
  - Additional Notes (textarea)
- Shows total price
- Confirm/Cancel buttons

---

### 4. Customer Dashboard (`/customer`)
- **URL**: `http://localhost:5173/customer`
- **Access**: Login required (customer role only)
- **Purpose**: Manage bookings, view history, leave reviews

#### Dashboard Features:

1. **Statistics Cards**:
   - Pending bookings count
   - Active bookings count
   - Completed bookings count
   - Color-coded cards with icons

2. **Booking Management**:
   - **Filter Buttons**:
     - All
     - Pending
     - Approved
     - Completed
   
   - **Booking Cards** (each shows):
     - Service name
     - Provider name
     - Booking date
     - Status (color-coded badge)
     - Location (suburb)
     - Total price
   
   - **Actions per Status**:
     - **Pending/Approved**: Cancel button
     - **Completed**: Leave Review button
   
   - **Cancel Booking**:
     - Confirmation dialog
     - Updates status to "cancelled"
     - Removes from active list
   
   - **Leave Review**:
     - Modal form opens
     - Star rating selector (1-5)
     - Comment textarea
     - Submit button
     - Prevents duplicate reviews

---

## 🔄 Booking Workflow

### Step 1: Search for Providers
```
/search → Apply filters → View results → Click provider
```

### Step 2: View Provider Details
```
/providers/:id → Review services & reviews → Click "Book Now"
```

### Step 3: Fill Booking Form
```
Modal opens → Fill required fields → Enter address → Click "Confirm Booking"
```

### Step 4: Booking Created
```
Status: Pending → Notification sent to provider → Redirected to /customer
```

### Step 5: Wait for Approval
```
Provider reviews request → Approves or rejects → Status updated → Email sent to customer
```

### Step 6: Service Completion
```
Service delivered → Status: Completed → Review button appears
```

### Step 7: Leave Review (Optional)
```
Click "Leave Review" → Fill rating & comment → Submit → Provider rating updated
```

---

## 📊 Status Legend

| Status | Color | Meaning |
|--------|-------|---------|
| pending | Yellow | Waiting for provider approval |
| approved | Blue | Provider accepted the booking |
| in_progress | Purple | Service is being delivered |
| completed | Green | Service finished, can review |
| cancelled | Red | Booking was cancelled |

---

## 🎯 User Scenarios

### Scenario 1: Find Plumber in Sydney
1. Go to `/search`
2. Type "plumbing" in Search field
3. Select "Sydney" suburb
4. Click Search
5. See plumbers in Sydney
6. Click "View Details & Book" on preferred plumber
7. Choose preferred service
8. Click "Book Now"
9. Fill booking form with your details
10. Confirm booking

### Scenario 2: Cancel a Booking
1. Go to `/customer` dashboard
2. Find booking with status "Pending" or "Approved"
3. Click "Cancel" button
4. Confirm cancellation in dialog
5. Booking status changes to "Cancelled"

### Scenario 3: Leave a Review
1. Go to `/customer` dashboard
2. Find completed booking
3. Click "Leave Review" button
4. Modal opens with review form
5. Rate service with stars (1-5)
6. Write your review comment
7. Click "Submit Review"
8. Review is submitted (pending approval)
9. Provider gets notified

---

## 🔐 Authentication

### Login Required for:
- Creating bookings
- Cancelling bookings
- Leaving reviews
- Accessing customer dashboard

### Public Access:
- Homepage
- Search page
- Provider details (view only, no booking)

---

## 📱 Responsive Design

All customer pages are fully responsive:
- **Desktop**: Full multi-column layouts
- **Tablet**: Adjusted grid layouts
- **Mobile**: Single column, touch-friendly buttons

---

## 💡 Tips & Tricks

1. **Filters**:
   - Leave search empty and just filter by suburb to see all local providers
   - Use rating filter to see highly-rated providers only
   - Specialties field accepts comma-separated values

2. **Booking**:
   - Booking date must be today or later (no past bookings)
   - Time field is optional but recommended
   - Leave notes for special requests or instructions

3. **Reviews**:
   - Can only review completed bookings (status must be "completed")
   - Each booking can only be reviewed once
   - Provider might respond to your review

4. **Notifications**:
   - Check email for booking status updates
   - Provider gets notified immediately when you book

---

## 🔗 Related Documentation

- [Provider Portal Features](./PROVIDER_FEATURES_COMPLETE.md)
- [Admin Portal Features](./ADMIN_FEATURE_STATUS.md)
- [API Documentation](./API.md)
- [Project Summary](./PROJECT_SUMMARY.md)

---

## ❓ Troubleshooting

### Issue: Can't see "Book Now" button
**Solution**: You must be logged in as a customer to book

### Issue: Can't leave review
**Solution**: Booking must be completed (status = "completed") before you can review

### Issue: Booking not appearing in dashboard
**Solution**: Refresh the page or check the booking email confirmation

### Issue: Can't cancel booking
**Solution**: Only pending and approved bookings can be cancelled, not completed ones

---

**Last Updated**: January 3, 2026  
**Status**: ✅ Complete and Tested
