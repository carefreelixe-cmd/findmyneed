# Service Provider Portal - QUICK REFERENCE

## 🚀 Access Points

| User Type | URL | Status |
|-----------|-----|--------|
| **New Provider** | `/register` (select "Provider") | Self-register |
| **Approved Provider** | `/provider` | Main portal |
| **Admin** | `/admin/providers` | Approve providers |

---

## 📱 Provider Pages

### 1. Dashboard `/provider`
**What:** Overview of provider activity
**Shows:** 4 stats cards, recent bookings, recent reviews

### 2. Profile `/provider/profile`
**What:** Business profile management
**Actions:** View/Edit business information

### 3. Services `/provider/services`
**What:** Service catalog management
**Actions:** Create, Edit, Delete services

### 4. Bookings `/provider/bookings`
**What:** Booking request management
**Actions:** Accept/Reject, change status, view history
**Statuses:** All, Pending, Approved, In Progress, Completed, Rejected

### 5. Reviews `/provider/reviews`
**What:** Customer reviews and ratings
**Actions:** Respond to reviews, view ratings

---

## ✨ Key Features at a Glance

| Feature | Location | Action |
|---------|----------|--------|
| View Rating | `/provider/reviews` | Displays average rating & count |
| Respond to Review | `/provider/reviews` | Click "Respond to Review" button |
| Edit Profile | `/provider/profile` | Click "Edit Profile" button |
| Add Service | `/provider/services` | Click "Add Service" button |
| Edit Service | `/provider/services` | Click edit icon on service card |
| Delete Service | `/provider/services` | Click delete icon on service card |
| Accept Booking | `/provider/bookings` | Click "Accept" on pending booking |
| Reject Booking | `/provider/bookings` | Click "Reject" on pending booking |
| Start Work | `/provider/bookings` | Click "Start Work" on approved booking |
| Complete Booking | `/provider/bookings` | Click "Complete" on in-progress booking |

---

## 🔄 Booking Status Transitions

```
PENDING ──Accept──> APPROVED ──Start Work──> IN PROGRESS ──Complete──> COMPLETED
   │
   └──Reject──> REJECTED
```

---

## 📊 Dashboard Statistics

| Widget | Shows | Calculates From |
|--------|-------|-----------------|
| Pending | Count of pending bookings | Bookings with status='pending' |
| Approved | Count of approved bookings | Bookings with status='approved' |
| Completed | Count of completed bookings | Bookings with status='completed' |
| Rating | Average star rating | All reviews for this provider |

---

## 🎨 Status Badge Colors

| Status | Color | When |
|--------|-------|------|
| Pending | Yellow | Waiting for provider response |
| Approved | Blue | Provider accepted booking |
| In Progress | Purple | Provider working on booking |
| Completed | Green | Booking finished |
| Rejected | Red | Provider declined booking |

---

## 📋 Required Fields

### Profile
- Business Name (required)
- All other fields optional

### Service
- Service Name (required)
- Category (required)
- Price (required)
- All other fields optional

### Respond to Review
- Response text (required)

---

## 🔐 Approval Status

| Status | Indicator | Can Accept Bookings |
|--------|-----------|-------------------|
| Pending | Yellow alert | ❌ No |
| Approved | Green confirmation | ✅ Yes |

---

## 📞 Workflow Examples

### Example 1: New Provider
1. Click `/register`
2. Select "Provider" type
3. Fill registration form
4. Receive login confirmation
5. Admin approves at `/admin/providers`
6. Provider logs in at `/provider`
7. Complete profile at `/provider/profile`
8. Add first service at `/provider/services`
9. Ready to receive bookings!

### Example 2: Manage Booking
1. Go to `/provider/bookings`
2. See pending booking (yellow)
3. Click "Accept" button
4. Status changes to "Approved" (blue)
5. "Start Work" button appears
6. Click "Start Work"
7. Status changes to "In Progress" (purple)
8. "Complete" button appears
9. Click "Complete"
10. Status changes to "Completed" (green)
11. Activity logged in admin logs

### Example 3: Respond to Review
1. Go to `/provider/reviews`
2. Find review with yellow "Respond" button
3. Click "Respond to Review"
4. Type your response
5. Click "Post Response"
6. Response appears below review
7. Shows your response date

---

## 🛠️ Backend API Reference

All endpoints require JWT authentication and provider role.

### Profile
```
GET /api/provider/profile              Get provider profile
PATCH /api/provider/profile             Update profile
```

### Services
```
GET /api/provider/services              List all services
POST /api/provider/services             Create service
PATCH /api/provider/services/:id        Update service
DELETE /api/provider/services/:id       Delete service
```

### Bookings
```
GET /api/provider/bookings              List bookings
GET /api/provider/bookings?status=X     Filter by status
PATCH /api/provider/bookings/:id/status Update status
```

### Reviews
```
GET /api/provider/reviews               List reviews
POST /api/provider/reviews/:id/respond  Add response
```

---

## 💡 Pro Tips

1. **Profile First:** Complete your profile before adding services
2. **Service Categories:** Choose from existing categories or ask admin to add new ones
3. **Service Areas:** List suburbs/cities you serve for better matching
4. **Respond Quickly:** Customers appreciate quick responses to reviews
5. **Regular Updates:** Update your services and specialties regularly
6. **Check Dashboard:** Monitor your stats daily to track performance

---

## ⚠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Can't see bookings | Check admin approval status first |
| Service not created | Verify all required fields filled |
| Button not appearing | Refresh page or check booking status |
| Review response failed | Ensure response text not empty |
| Profile won't save | Check required fields (Business Name) |

---

## 📧 Email Notifications (When Configured)

**You will receive emails for:**
- ✉️ New booking request
- ✉️ Customer message
- ✉️ Review posted
- ✉️ Admin approval confirmation

**Customer receives emails for:**
- ✉️ Booking accepted
- ✉️ Booking rejected
- ✉️ Work started
- ✉️ Work completed
- ✉️ Your review response

---

## 🎯 At a Glance

| What | Where | How |
|------|-------|-----|
| Register | `/register` | Select "Provider" type |
| Dashboard | `/provider` | Automatic after approval |
| Manage Profile | `/provider/profile` | Click "Edit Profile" |
| Manage Services | `/provider/services` | "Add Service" button |
| Accept Bookings | `/provider/bookings` | Click "Accept" button |
| Complete Bookings | `/provider/bookings` | Follow status workflow |
| Respond to Reviews | `/provider/reviews` | Click "Respond" button |
| Get Approved | Admin: `/admin/providers` | Admin clicks approve |

---

## ✅ Verification Checklist

Before going live, verify:
- [ ] Can self-register as provider
- [ ] Dashboard loads after approval
- [ ] Can edit profile with all fields
- [ ] Can create service with all required fields
- [ ] Can accept/reject bookings
- [ ] Can complete booking workflow
- [ ] Can respond to reviews
- [ ] Average rating calculates correctly
- [ ] Mobile design responsive
- [ ] All forms validate properly

---

**Service Provider Portal - Quick Reference Guide**
*Keep this handy for common tasks and troubleshooting*
