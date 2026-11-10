# Business (Provider) Management Guide

## Overview
The Business Management module allows admins to:
- **View all businesses** in a list format
- **Create individual businesses** manually with forms
- **Bulk import up to 500 businesses** from CSV files
- **Edit existing businesses** and their service assignments
- **Delete businesses** with associated data cleanup

---

## Creating a Business Manually

### Steps:
1. Go to **Admin Dashboard → Businesses**
2. Click **Create Business** tab
3. Fill in the required fields:
   - **Business Name** (required)
   - **Email** (required, must be unique)
   - **Phone** (optional)
   - **Description** (optional)
4. Select which **Services** this business provides (checkboxes)
5. Click **Create Business** button

### Notes:
- Email addresses must be unique across all businesses
- A temporary password will be generated automatically
- The business owner will receive login credentials via email (when configured)

---

## Editing a Business

### Steps:
1. Go to **Businesses List** tab
2. Find the business you want to edit
3. Click the **Edit** button
4. Update the business information
5. Change service assignments if needed
6. Click **Update Business**

### Notes:
- Email cannot be changed (it's the unique identifier)
- Service assignments can be fully modified
- All changes are logged in the activity logs

---

## Bulk CSV Import

### Maximum Limit:
- **500 businesses per import**
- Use multiple imports if you have more than 500 businesses

### CSV Format:

Your CSV file must have these columns (case-insensitive):
| Column Name | Required | Format | Example |
|---|---|---|---|
| name | Yes | Text | John Plumbing |
| email | Yes | Valid email | john@plumbing.com |
| phone | No | Phone number | 0412345678 |
| description | No | Text | Expert plumbing services |
| serviceIds | No | Semicolon-separated IDs | 1;2;3 |
| suburbIds | No | Semicolon-separated suburbs | 1;2;3 |

### Example CSV:
```csv
name,email,phone,description,serviceIds,suburbIds
John Plumbing,john@plumbing.com,0412345678,Expert plumbing services,1;2,1;2;3
Electric Pro,contact@electricpro.com,0412345679,Electrical maintenance,3,1;2
```

### Steps:
1. Go to **Admin Dashboard → Businesses**
2. Click **Bulk Import** tab
3. Click **Download CSV Template** to get the template with proper format
4. Fill in your business data following the format
5. Select your CSV file (drag & drop or click to browse)
6. Click **Import Businesses**
7. Review the results:
   - Successful imports show the count
   - Failed imports show error details

### Validation Rules:
- ✅ Email must be unique (not already in system)
- ✅ Name and email are required for each business
- ✅ Phone and description are optional
- ✅ Service IDs must be valid (must exist in the system)
- ✅ Suburb IDs must be valid (must exist in the system)
- ✅ Maximum 500 businesses per import
- ✅ CSV must have proper headers (name, email, phone, description, serviceIds, suburbIds)

### Error Handling:
If some rows fail during import:
- The successful rows ARE imported and saved
- Failed rows show specific error messages
- You can fix the failed rows and re-import them

### Common Errors:
| Error | Solution |
|---|---|
| Duplicate email | Ensure each email is unique in your CSV |
| Missing required field | Ensure 'name' and 'email' columns exist |
| Invalid service ID | Check that service IDs exist in the system |
| CSV format error | Download template and follow exact format |

---

## Database Integration

### Tables Used:
- `users` - Stores email/password for each business
- `providers` - Stores business information
- `provider_services` - Links providers to their services
- `provider_service_areas` - Links providers to service areas (suburbs)
- `activity_logs` - Tracks all admin actions

### Automatic Features:
- Temporary passwords are generated using bcryptjs
- Each business gets a unique provider ID
- All changes are logged with admin user ID and timestamp
- Soft deletes are available (deleted_at field) for audit trail

---

## Tips & Best Practices

1. **Before Bulk Import:**
   - Validate your data in Excel/Sheets first
   - Ensure all emails are unique
   - Verify service IDs exist in system
   - Test with a small batch first (5-10 businesses)

2. **Service Assignment:**
   - You can update service assignments later if needed
   - Use the Edit feature to add/remove services

3. **Data Cleanup:**
   - If you make mistakes with bulk import, you can delete and re-import
   - The Delete feature removes the business entirely
   - Be careful - deletion is permanent!

4. **Support:**
   - Check the import results carefully
   - If import fails, review the error messages
   - Fix the data and try again

---

## API Endpoints (for developers)

```
GET    /api/admin/services                    - Get all active services
GET    /api/admin/businesses/:id              - Get business details with services
POST   /api/admin/businesses                  - Create single business
POST   /api/admin/businesses/bulk-import      - Import multiple businesses from CSV
PUT    /api/admin/businesses/:id              - Update business details
DELETE /api/admin/businesses/:id              - Delete business
```

### Request/Response Examples:

**Create Business:**
```json
POST /api/admin/businesses
{
  "name": "John Plumbing",
  "email": "john@plumbing.com",
  "phone": "0412345678",
  "description": "Expert plumbing services",
  "serviceIds": [1, 2],
  "suburbIds": [1, 2, 3]
}
```

**Bulk Import:**
```json
POST /api/admin/businesses/bulk-import
{
  "businesses": [
    {
      "name": "John Plumbing",
      "email": "john@plumbing.com",
      "phone": "0412345678",
      "description": "Expert plumbing services",
      "serviceIds": [1, 2],
      "suburbIds": [1, 2, 3]
    }
  ]
}
```

**Response:**
```json
{
  "message": "Bulk import completed",
  "successful": 498,
  "failed": [
    "Row 3: Email already exists - duplicate@email.com",
    "Row 7: Missing required field 'name'"
  ]
}
```
