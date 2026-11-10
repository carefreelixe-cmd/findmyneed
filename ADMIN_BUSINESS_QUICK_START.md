# Admin Business Management - Quick Reference

## 🚀 Quick Start

### Access the Feature
1. Login as Admin
2. Click **Admin Dashboard** (top right)
3. Click **Businesses** in the navigation menu
4. Choose your action: List | Create | Bulk Import

---

## 📋 Three Main Actions

### 1️⃣ **View All Businesses**
- Tab: **Businesses List**
- Shows: Name, Email, Phone, Status, Services Count
- Actions: **Edit** or **Delete** button per business

### 2️⃣ **Create Single Business**
- Tab: **Create Business**
- Fields: Name, Email, Phone, Description, Services
- Click: **Create Business** button
- Result: Business created and appears in list

### 3️⃣ **Bulk Import CSV**
- Tab: **Bulk Import**
- Max: **500 businesses** per file
- Steps:
  1. Click **Download CSV Template** (optional)
  2. Select CSV file (or drag & drop)
  3. Click **Import Businesses**
  4. Review results (✅ successful, ❌ failed)

---

## 📊 CSV Format (Bulk Import)

### Required Columns
```
name,email,phone,description,serviceIds,suburbIds
```

### Example
```csv
name,email,phone,description,serviceIds,suburbIds
John Plumbing,john@plumbing.com,0412345678,Expert plumbing,1;2,1;2;3
Electric Pro,contact@electricpro.com,0412345679,Electrical services,3,2;3
```

### Column Definitions
| Column | Required | Example | Notes |
|--------|----------|---------|-------|
| name | ✅ Yes | John Plumbing | Business name |
| email | ✅ Yes | john@plumbing.com | Must be unique |
| phone | No | 0412345678 | Optional |
| description | No | Expert services | Optional |
| serviceIds | No | 1;2;3 | Semicolon-separated |
| suburbIds | No | 1;2;3 | Semicolon-separated |

---

## ⚠️ Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Email already exists" | Duplicate email in system | Use unique emails |
| "Missing required field" | Missing name or email | Fill all required fields |
| "Invalid service ID" | Service doesn't exist | Check service ID list |
| "CSV format error" | Wrong column headers | Download template |
| "More than 500 rows" | Too many businesses | Split into multiple files |

---

## 🔄 Workflows

### Workflow 1: Add Single Provider
```
1. Go to Businesses → Create Business tab
2. Fill form completely
3. Select services from checkboxes
4. Click "Create Business"
5. Confirm success message
```

### Workflow 2: Bulk Import from CSV
```
1. Go to Businesses → Bulk Import tab
2. Download template (optional)
3. Prepare CSV file with data
4. Select file and upload
5. Check results
6. Failed rows? Fix and re-import
```

### Workflow 3: Update Provider Services
```
1. Go to Businesses List
2. Click "Edit" button
3. Check/uncheck services
4. Click "Update Business"
5. Confirm success
```

### Workflow 4: Remove Provider
```
1. Go to Businesses List
2. Click "Delete" button
3. Confirm in popup
4. Provider removed (all data cleaned up)
```

---

## ✨ Key Features

✅ **Bulk operations** - Import 500 at once  
✅ **Manual creation** - Create one at a time with form  
✅ **Service assignment** - Assign multiple services  
✅ **Area assignment** - Assign service areas/suburbs  
✅ **Edit anytime** - Update any field later  
✅ **Delete safe** - Confirmation required  
✅ **Error tracking** - Detailed failure messages  
✅ **Activity logging** - All changes tracked  

---

## 🔐 Permissions

- ✅ **Admin** - Full access to all business operations
- ❌ **Provider** - Cannot access business management
- ❌ **Customer** - Cannot access business management

---

## 💾 Automatic Features

When you create/import a business:
- ✅ User account created (email + password)
- ✅ Provider profile created
- ✅ Services assigned
- ✅ Areas assigned
- ✅ Activity logged
- ✅ Status set to Active

---

## 📞 Support

**If CSV import fails:**
1. Check error message
2. Fix the data
3. Re-upload file
4. Previously successful rows already saved

**If service doesn't appear:**
1. Ensure service is active in system
2. Get service ID from Services dropdown
3. Use correct ID in CSV

**If edit doesn't save:**
1. Check browser console (F12)
2. Verify email isn't changed (read-only)
3. Try again or refresh page

---

## 🎯 Tips

- 💡 Download template before bulk import
- 💡 Test with 5 businesses first
- 💡 Email is unique identifier - can't change
- 💡 Service IDs are semicolon-separated (1;2;3)
- 💡 Deleted data is permanent - be careful!
- 💡 Check activity logs for audit trail

---

## 📋 Data Checked

Each import validates:
- ✅ Email is unique
- ✅ Name is not empty
- ✅ Email is valid format
- ✅ Service IDs exist
- ✅ Area IDs exist
- ✅ Max 500 rows

---

## 🌐 API Reference (For Developers)

```bash
# Get all services (for dropdown)
GET /api/admin/services

# Create single business
POST /api/admin/businesses
Body: { name, email, phone, description, serviceIds[], suburbIds[] }

# Bulk import businesses
POST /api/admin/businesses/bulk-import
Body: { businesses: [{ name, email, ... }] }

# Get business details
GET /api/admin/businesses/:id

# Update business
PUT /api/admin/businesses/:id
Body: { name, description, serviceIds[], suburbIds[] }

# Delete business
DELETE /api/admin/businesses/:id
```

---

## Last Updated
✅ Implementation Complete - Ready for Production
