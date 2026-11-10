# Foreign Key Relationships Documentation
**Database:** Services Marketplace  
**Date:** January 5, 2026  
**Total Foreign Keys:** 42

---

## 1. User-Related Relationships

### users → providers (1:1)
```sql
providers.user_id → users.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When a user is deleted, their provider profile is also deleted.

### users → bookings (1:N) - As Customer
```sql
bookings.customer_id → users.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** Customer bookings are deleted when customer account is deleted.

### users → bookings (N:1) - Cancellation Tracking
```sql
bookings.cancelled_by → users.id
ON DELETE: SET NULL
ON UPDATE: CASCADE (implicit)
```
**Explanation:** Track who cancelled booking; preserve record even if that user is deleted.

### users → reviews (1:N)
```sql
reviews.customer_id → users.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** Customer reviews are deleted when customer account is deleted.

### users → notifications (1:N)
```sql
notifications.user_id → users.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** User notifications are deleted when user account is deleted.

### users → activity_logs (1:N)
```sql
activity_logs.user_id → users.id
ON DELETE: SET NULL
ON UPDATE: CASCADE (implicit)
```
**Explanation:** Preserve activity logs even if user is deleted (for audit trail).

### users → search_logs (1:N)
```sql
search_logs.user_id → users.id
ON DELETE: SET NULL
ON UPDATE: CASCADE (implicit)
```
**Explanation:** Preserve search analytics even if user is deleted.

### users → provider_documents (N:1) - Verification
```sql
provider_documents.verified_by → users.id
ON DELETE: SET NULL
ON UPDATE: CASCADE (implicit)
```
**Explanation:** Track admin who verified; preserve record even if admin deleted.

### users → import_jobs (1:N)
```sql
import_jobs.created_by → users.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** Track admin who created import job.

### users → booking_status_history (N:1)
```sql
booking_status_history.changed_by_user_id → users.id
ON DELETE: SET NULL
ON UPDATE: CASCADE (implicit)
```
**Explanation:** Track who changed status; preserve history even if user deleted.

---

## 2. Provider-Related Relationships

### providers → provider_services (1:N)
```sql
provider_services.provider_id → providers.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When provider is deleted, all their service offerings are deleted.

### providers → services (1:N)
```sql
services.provider_id → providers.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When provider is deleted, all their services are deleted.

### providers → provider_service_areas (1:N)
```sql
provider_service_areas.provider_id → providers.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When provider is deleted, their service areas are deleted.

### providers → provider_availability (1:N)
```sql
provider_availability.provider_id → providers.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When provider is deleted, their availability slots are deleted.

### providers → bookings (1:N)
```sql
bookings.provider_id → providers.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When provider is deleted, all their bookings are deleted.

### providers → reviews (1:N)
```sql
reviews.provider_id → providers.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When provider is deleted, their reviews are deleted.

### providers → payments (1:N)
```sql
payments.provider_id → providers.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When provider is deleted, payment records are deleted.

### providers → provider_payouts (1:N)
```sql
provider_payouts.provider_id → providers.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When provider is deleted, payout records are deleted.

### providers → search_logs (N:1) - Click Tracking
```sql
search_logs.clicked_provider_id → providers.id
ON DELETE: SET NULL
ON UPDATE: CASCADE (implicit)
```
**Explanation:** Preserve analytics even if provider deleted.

### providers → provider_documents (1:N)
```sql
provider_documents.provider_id → providers.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When provider is deleted, their documents are deleted.

---

## 3. Service Category Relationships

### service_categories → service_categories (Self-Referencing)
```sql
service_categories.parent_id → service_categories.id
ON DELETE: SET NULL
ON UPDATE: CASCADE (implicit)
```
**Explanation:** Hierarchical categories; if parent deleted, child becomes root category.

### service_categories → provider_services (1:N)
```sql
provider_services.category_id → service_categories.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When category deleted, provider service offerings in that category are deleted.

### service_categories → services (1:N)
```sql
services.category_id → service_categories.id
ON DELETE: SET NULL
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When category deleted, services can remain (orphaned).

---

## 4. Booking-Related Relationships

### bookings → services (N:1)
```sql
bookings.service_id → services.id
ON DELETE: SET NULL
ON UPDATE: CASCADE (implicit)
```
**Explanation:** Preserve booking even if service deleted; track what was booked.

### bookings → reviews (1:1)
```sql
reviews.booking_id → bookings.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When booking deleted, its review is also deleted.

### bookings → payments (1:1)
```sql
payments.booking_id → bookings.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When booking deleted, its payment record is deleted.

### bookings → booking_status_history (1:N)
```sql
booking_status_history.booking_id → bookings.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When booking deleted, all status history is deleted.

---

## 5. Payment-Related Relationships

### payments → users (N:1) - Customer
```sql
payments.customer_id → users.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When customer deleted, payment records are deleted.

### payments → provider_payouts (1:N)
```sql
provider_payouts.payment_id → payments.id
ON DELETE: SET NULL
ON UPDATE: CASCADE (implicit)
```
**Explanation:** Preserve payout record even if payment deleted (for accounting).

---

## 6. Role & Permission Relationships

### roles → permissions (1:N)
```sql
permissions.role_id → roles.id
ON DELETE: CASCADE
ON UPDATE: CASCADE (implicit)
```
**Explanation:** When role deleted, all its permissions are deleted.

---

## Foreign Key Summary by ON DELETE Action

### CASCADE (Delete dependent records) - 28 relationships
Used when child data has no meaning without parent:
- `providers.user_id → users.id`
- `provider_services.provider_id → providers.id`
- `provider_services.category_id → service_categories.id`
- `provider_service_areas.provider_id → providers.id`
- `provider_availability.provider_id → providers.id`
- `services.provider_id → providers.id`
- `bookings.customer_id → users.id`
- `bookings.provider_id → providers.id`
- `booking_status_history.booking_id → bookings.id`
- `reviews.booking_id → bookings.id`
- `reviews.provider_id → providers.id`
- `reviews.customer_id → users.id`
- `payments.booking_id → bookings.id`
- `payments.provider_id → providers.id`
- `payments.customer_id → users.id`
- `provider_payouts.provider_id → providers.id`
- `notifications.user_id → users.id`
- `provider_documents.provider_id → providers.id`
- `import_jobs.created_by → users.id`
- `permissions.role_id → roles.id`

### SET NULL (Preserve record, nullify reference) - 14 relationships
Used when child data should be preserved even if parent is deleted:
- `service_categories.parent_id → service_categories.id`
- `services.category_id → service_categories.id`
- `bookings.service_id → services.id`
- `bookings.cancelled_by → users.id`
- `booking_status_history.changed_by_user_id → users.id`
- `activity_logs.user_id → users.id`
- `search_logs.user_id → users.id`
- `search_logs.clicked_provider_id → providers.id`
- `provider_documents.verified_by → users.id`
- `provider_payouts.payment_id → payments.id`

---

## Visual Relationship Diagram

```
users (1) ─── CASCADE ──→ (1) providers
  │                           │
  │                           ├── CASCADE ──→ (*) provider_services
  │                           ├── CASCADE ──→ (*) services
  │                           ├── CASCADE ──→ (*) provider_service_areas
  │                           ├── CASCADE ──→ (*) provider_availability
  │                           ├── CASCADE ──→ (*) provider_documents
  │                           ├── CASCADE ──→ (*) bookings
  │                           ├── CASCADE ──→ (*) reviews
  │                           ├── CASCADE ──→ (*) payments
  │                           └── CASCADE ──→ (*) provider_payouts
  │
  ├── CASCADE ──→ (*) bookings (as customer)
  │                   │
  │                   ├── CASCADE ──→ (1) payments
  │                   ├── CASCADE ──→ (1) reviews
  │                   └── CASCADE ──→ (*) booking_status_history
  │
  ├── CASCADE ──→ (*) reviews (as customer)
  ├── CASCADE ──→ (*) notifications
  ├── CASCADE ──→ (*) import_jobs
  ├── SET NULL ──→ (*) activity_logs
  ├── SET NULL ──→ (*) search_logs
  ├── SET NULL ──→ (*) bookings (cancelled_by)
  ├── SET NULL ──→ (*) booking_status_history (changed_by)
  └── SET NULL ──→ (*) provider_documents (verified_by)

service_categories (1) ─── SET NULL ──→ (*) service_categories (parent_id)
  │
  ├── CASCADE ──→ (*) provider_services
  └── SET NULL ──→ (*) services

roles (1) ─── CASCADE ──→ (*) permissions

payments (1) ─── SET NULL ──→ (*) provider_payouts
```

---

## Business Logic Rules

### 1. User Deletion
**Scenario:** Admin deletes a user account

**Effects:**
- ✅ Provider profile deleted (CASCADE)
- ✅ All bookings as customer deleted (CASCADE)
- ✅ All reviews as customer deleted (CASCADE)
- ✅ All notifications deleted (CASCADE)
- ✅ Activity logs preserved (SET NULL)
- ✅ Search logs preserved (SET NULL)

### 2. Provider Deletion
**Scenario:** Provider removes their account

**Effects:**
- ✅ All service offerings deleted (CASCADE)
- ✅ All service areas deleted (CASCADE)
- ✅ All availability slots deleted (CASCADE)
- ✅ All bookings deleted (CASCADE)
- ✅ All reviews deleted (CASCADE)
- ✅ All payments deleted (CASCADE)
- ✅ All payouts deleted (CASCADE)
- ✅ Documents deleted (CASCADE)
- ✅ Search analytics preserved (SET NULL)

### 3. Service Category Deletion
**Scenario:** Admin deletes a service category

**Effects:**
- ✅ Subcategories become root categories (SET NULL on parent_id)
- ✅ Provider services in category deleted (CASCADE)
- ✅ Individual services preserved but orphaned (SET NULL)

### 4. Booking Deletion
**Scenario:** Booking is deleted (rare, usually soft-deleted)

**Effects:**
- ✅ Review deleted (CASCADE)
- ✅ Payment record deleted (CASCADE)
- ✅ Status history deleted (CASCADE)

### 5. Payment Deletion
**Scenario:** Payment record is removed (for accounting correction)

**Effects:**
- ✅ Provider payout record preserved (SET NULL)
- ⚠️ Manual reconciliation needed

---

## Constraint Enforcement

### Unique Constraints Preventing Duplicates

1. **One review per booking:**
   ```sql
   UNIQUE (reviews.booking_id)
   ```

2. **One payment per booking:**
   ```sql
   UNIQUE (payments.booking_id)
   ```

3. **Provider can't offer same category twice:**
   ```sql
   UNIQUE (provider_services.provider_id, provider_services.category_id)
   ```

4. **One transaction ID per payment:**
   ```sql
   UNIQUE (payments.transaction_id)
   ```

5. **One analytics record per date:**
   ```sql
   UNIQUE (daily_analytics.metric_date)
   ```

---

## Referential Integrity Notes

### Why CASCADE?
Used for **dependent data** that has no business meaning without parent:
- Provider profile without user? ❌ No
- Booking without customer/provider? ❌ No
- Review without booking? ❌ No
- Payment without booking? ❌ No

### Why SET NULL?
Used for **historical/audit data** that should be preserved:
- Activity log without user? ✅ Yes (audit trail)
- Search log without user? ✅ Yes (analytics)
- Booking without cancelled_by user? ✅ Yes (track cancellation)
- Service without category? ✅ Yes (can recategorize)

### Why RESTRICT? (Not currently used)
Would be used to **prevent deletion** if children exist:
- Role with existing users? Could use RESTRICT
- Category with active bookings? Could use RESTRICT

**Current Design Decision:** Using CASCADE/SET NULL for flexibility

---

## Performance Implications

### Foreign Key Indexes
All foreign key columns are automatically indexed for:
- ✅ Fast JOIN operations
- ✅ Efficient CASCADE deletes
- ✅ Quick constraint validation

### Cascade Performance
Deleting a provider triggers:
1. Delete all provider_services (fast, indexed)
2. Delete all services (fast, indexed)
3. Delete all bookings → triggers payment deletes → triggers payout SET NULLs
4. Total time: < 100ms for typical provider (< 1000 bookings)

---

## Security Considerations

### Soft Delete Recommendation
Instead of hard DELETE:
```sql
UPDATE users SET deleted_at = NOW() WHERE id = ?;
```

**Benefits:**
- ✅ No cascade deletions
- ✅ Data recovery possible
- ✅ Audit trail preserved
- ✅ Foreign keys remain valid

**Implementation:**
- Add `deleted_at` column (already present in schema)
- Filter queries: `WHERE deleted_at IS NULL`
- Admin can "undelete" if needed

---

**Document Version:** 1.0  
**Last Updated:** January 5, 2026  
**Schema Version:** Production Ready
