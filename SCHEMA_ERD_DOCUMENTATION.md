# Entity Relationship Diagram Documentation
## Services Marketplace Platform - Complete Schema

**Last Updated:** January 5, 2026

---

## ERD Structure Overview

### Core Entity Groups

#### 1. **User Management & RBAC**
```
┌──────────────┐
│    ROLES     │
├──────────────┤
│ id (PK)      │
│ name (U)     │
│ description  │
└──────────────┘
       │
       │ 1:N
       ▼
┌──────────────────────┐
│   PERMISSIONS        │
├──────────────────────┤
│ id (PK)              │
│ role_id (FK)         │
│ resource             │
│ action               │
└──────────────────────┘

┌──────────────────────────────────┐
│         USERS                    │
├──────────────────────────────────┤
│ id (PK, UUID)                    │
│ email (U)                        │
│ password_hash                    │
│ role (admin|provider|customer)   │
│ first_name, last_name            │
│ phone                            │
│ is_active, is_approved           │
│ email_verified_at                │
│ reset_token, reset_token_expires │
│ last_login_at                    │
│ created_at, updated_at, deleted_at│
└──────────────────────────────────┘
       │
       ├─ 1:1 ─────────────────────────┐
       │                               │
       │                        ┌──────────────────────┐
       │                        │    PROVIDERS         │
       │                        ├──────────────────────┤
       │                        │ id (PK)              │
       │                        │ user_id (FK, U)      │
       │                        │ business_name        │
       │                        │ business_description │
       │                        │ business_logo        │
       │                        │ address, suburb, etc │
       │                        │ rating (DECIMAL)     │
       │                        │ total_reviews        │
       │                        │ total_bookings       │
       │                        │ is_verified          │
       │                        │ verification_date    │
       │                        └──────────────────────┘
       │
       └─ 1:N (canceller) ────────────────────┐
                                              │
┌──────────────────────────────────────────────┘
│ (Other 1:N relationships below)
```

#### 2. **Service & Category Management**
```
┌─────────────────────────────┐
│  SERVICE_CATEGORIES         │ (Hierarchical)
├─────────────────────────────┤
│ id (PK)                     │
│ name (U)                    │
│ parent_id (FK, self, null)  │ ◄─ Parent category (null = top level)
│ slug (U)                    │
│ description                 │
│ icon                        │
│ is_active                   │
│ display_order               │
└─────────────────────────────┘
       │
       ├─ 1:N ──────────────────────────────────────┐
       │                                            │
       │                           ┌────────────────────────┐
       │                           │  PROVIDER_SERVICES     │
       │                           ├────────────────────────┤
       │                           │ id (PK)                │
       │                           │ provider_id (FK)       │
       │                           │ category_id (FK)       │
       │                           │ custom_price           │
       │                           │ base_price             │
       │                           │ description            │
       │                           │ is_active              │
       │                           └────────────────────────┘
       │                                    ▲
       │                                    │ M:M via junction
       │                                    │
       │                            ┌───────────────┐
       │                            │ PROVIDERS     │
       │                            └───────────────┘
       │
       └─ 1:N ──────────────────────┐
                                    │
                        ┌───────────────────┐
                        │   SERVICES        │
                        ├───────────────────┤
                        │ id (PK)           │
                        │ provider_id (FK)  │
                        │ category_id (FK)  │
                        │ name              │
                        │ slug              │
                        │ description       │
                        │ price             │
                        │ duration          │
                        │ images (array)    │
                        │ is_active         │
                        └───────────────────┘
```

#### 3. **Provider Operations**
```
┌──────────────────────────────────────────────────┐
│           PROVIDERS                              │
├──────────────────────────────────────────────────┤
│ Relationships: 1:N to multiple operational tables│
└──────────────────────────────────────────────────┘
       │
       ├─ 1:N ────────────────────────────────────┐
       │                                          │
       │         ┌──────────────────────────────┐ │
       │         │ PROVIDER_SERVICE_AREAS       │ │
       │         ├──────────────────────────────┤ │
       │         │ id (PK)                      │ │
       │         │ provider_id (FK)             │ │
       │         │ suburb                       │ │  (For location-based search)
       │         │ postcode                     │ │
       │         │ service_area_name            │ │
       │         │ is_active                    │ │
       │         └──────────────────────────────┘ │
       │                                          │
       ├─ 1:N ────────────────────────────────────┐
       │                                          │
       │         ┌──────────────────────────────┐ │
       │         │ PROVIDER_AVAILABILITY        │ │
       │         ├──────────────────────────────┤ │
       │         │ id (PK)                      │ │
       │         │ provider_id (FK)             │ │
       │         │ available_date               │ │  (For booking scheduling)
       │         │ time_slot_start              │ │
       │         │ time_slot_end                │ │
       │         │ max_bookings_per_slot        │ │
       │         └──────────────────────────────┘ │
       │                                          │
       ├─ 1:N ────────────────────────────────────┐
       │                                          │
       │         ┌──────────────────────────────┐ │
       │         │ PROVIDER_DOCUMENTS           │ │
       │         ├──────────────────────────────┤ │
       │         │ id (PK)                      │ │
       │         │ provider_id (FK)             │ │
       │         │ document_type                │ │  (Verification docs)
       │         │ file_path                    │ │
       │         │ is_verified                  │ │
       │         │ verified_by (FK -> users)    │ │
       │         │ verified_at                  │ │
       │         └──────────────────────────────┘ │
       │                                          │
       └─ 1:N ────────────────────────────────────┐
                                                 │
                                     ┌──────────────────────────┐
                                     │ PROVIDER_PAYOUTS         │
                                     ├──────────────────────────┤
                                     │ id (PK)                  │
                                     │ provider_id (FK)         │
                                     │ payment_id (FK, null)    │
                                     │ total_earnings           │
                                     │ commission_deducted      │
                                     │ payout_amount            │
                                     │ payout_status            │
                                     │ payout_method            │
                                     │ payout_date              │
                                     └──────────────────────────┘
```

#### 4. **Booking & Transaction Flow**
```
CUSTOMERS (Users with role='customer')
       │
       ├─ 1:N ─────────────────────────────────────────────┐
       │                                                   │
       │                              ┌────────────────────────────┐
       │                              │     BOOKINGS               │
       │                              ├────────────────────────────┤
       │                              │ id (PK)                    │
       │                              │ customer_id (FK)           │
       │                              │ provider_id (FK)           │
       │                              │ service_id (FK)            │
       │                              │ status (pending|confirmed) │
       │                              │ booking_date               │
       │                              │ booking_time               │
       │                              │ address, suburb            │
       │                              │ total_price                │
       │                              │ payment_status             │
       │                              │ payment_id (FK)            │
       │                              │ cancelled_by (FK, null)    │
       │                              │ cancellation_reason        │
       │                              │ completed_at               │
       │                              └────────────────────────────┘
       │                                       │
       │                                       ├─ 1:N ──────────────────────┐
       │                                       │                           │
       │                                       │      ┌───────────────────────────┐
       │                                       │      │ BOOKING_STATUS_HISTORY    │
       │                                       │      ├───────────────────────────┤
       │                                       │      │ id (PK)                   │
       │                                       │      │ booking_id (FK)           │
       │                                       │      │ old_status                │
       │                                       │      │ new_status                │
       │                                       │      │ changed_by_user_id (FK)   │ (Audit trail)
       │                                       │      │ notes                     │
       │                                       │      │ created_at                │
       │                                       │      └───────────────────────────┘
       │                                       │
       │                                       ├─ 1:1 ──────────────────────┐
       │                                       │                           │
       │                                       │      ┌───────────────────────────┐
       │                                       │      │    REVIEWS                │
       │                                       │      ├───────────────────────────┤
       │                                       │      │ id (PK)                   │
       │                                       │      │ booking_id (FK, U)        │ (One per booking)
       │                                       │      │ provider_id (FK)          │
       │                                       │      │ customer_id (FK)          │
       │                                       │      │ rating (1-5)              │
       │                                       │      │ comment                   │
       │                                       │      │ is_approved               │
       │                                       │      └───────────────────────────┘
       │                                       │
       │                                       └─ 1:1 ──────────────────────┐
       │                                                                   │
       │                                          ┌────────────────────────────┐
       │                                          │     PAYMENTS               │
       │                                          ├────────────────────────────┤
       │                                          │ id (PK)                    │
       │                                          │ booking_id (FK, U)         │
       │                                          │ provider_id (FK)           │
       │                                          │ customer_id (FK)           │
       │                                          │ total_amount               │
       │                                          │ commission_amount          │
       │                                          │ provider_payout_amount     │
       │                                          │ payment_gateway            │
       │                                          │ transaction_id (U)         │
       │                                          │ payment_status             │
       │                                          │ paid_at                    │
       │                                          │ refunded_at                │
       │                                          └────────────────────────────┘
       │
       └─ 1:N ──────────────────────────────────────────────┐
                                                            │
                                              ┌───────────────────────────┐
                                              │   NOTIFICATIONS           │
                                              ├───────────────────────────┤
                                              │ id (PK)                   │
                                              │ user_id (FK)              │
                                              │ type (email|sms|push)     │
                                              │ subject (email)           │
                                              │ message                   │
                                              │ recipient (email/phone)   │
                                              │ sent_at                   │
                                              │ read_at                   │
                                              └───────────────────────────┘
```

#### 5. **CMS & Content Management**
```
┌────────────────────┐
│     PAGES (CMS)    │
├────────────────────┤
│ id (PK)            │
│ slug (U)           │
│ title              │
│ content            │
│ meta_title         │
│ meta_description   │
│ is_published       │
│ published_at       │
└────────────────────┘

┌────────────────────┐
│    BANNERS         │
├────────────────────┤
│ id (PK)            │
│ title              │
│ image_url          │
│ link_url           │
│ position           │
│ display_order      │
│ is_active          │
│ display_from       │
│ display_to         │
└────────────────────┘

┌────────────────────┐
│     FAQs           │
├────────────────────┤
│ id (PK)            │
│ question           │
│ answer             │
│ category           │
│ display_order      │
│ is_active          │
└────────────────────┘
```

#### 6. **Admin & Analytics**
```
┌──────────────────────────────────┐
│     ACTIVITY_LOGS                │
├──────────────────────────────────┤
│ id (PK)                          │
│ user_id (FK, null)               │
│ action (created|updated|deleted) │
│ entity_type                      │
│ entity_id                        │
│ old_values (JSONB)               │  (For audit trail)
│ new_values (JSONB)               │
│ ip_address                       │
│ user_agent                       │
│ created_at                       │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│     SEARCH_LOGS                  │
├──────────────────────────────────┤
│ id (PK)                          │
│ user_id (FK, null)               │
│ search_query                     │
│ filters_applied (JSONB)          │  (For analytics)
│ results_count                    │
│ clicked_provider_id (FK, null)   │
│ clicked_at                       │
│ created_at                       │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│   DAILY_ANALYTICS                │
├──────────────────────────────────┤
│ id (PK)                          │
│ metric_date (U)                  │
│ total_bookings                   │
│ total_revenue                    │
│ active_providers                 │
│ active_customers                 │
│ new_providers                    │
│ new_customers                    │
│ average_rating                   │
│ total_searches                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│     IMPORT_JOBS                  │
├──────────────────────────────────┤
│ id (PK)                          │
│ import_type                      │
│ file_url                         │
│ status (pending|processing|done) │
│ total_rows                       │
│ rows_processed                   │
│ rows_failed                      │
│ error_log (JSONB)                │
│ created_by (FK -> users)         │
│ completed_at                     │
└──────────────────────────────────┘
```

---

## Complete Relationship Map

### Many-to-One Relationships
```
provider_services.provider_id → providers.id
provider_services.category_id → service_categories.id
services.provider_id → providers.id
services.category_id → service_categories.id
provider_service_areas.provider_id → providers.id
provider_availability.provider_id → providers.id
bookings.customer_id → users.id
bookings.provider_id → providers.id
bookings.service_id → services.id
bookings.payment_id → payments.id (nullable)
bookings.cancelled_by → users.id (nullable)
booking_status_history.booking_id → bookings.id
booking_status_history.changed_by_user_id → users.id (nullable)
reviews.booking_id → bookings.id (UNIQUE - one per booking)
reviews.provider_id → providers.id
reviews.customer_id → users.id
payments.booking_id → bookings.id (UNIQUE - one per booking)
payments.provider_id → providers.id
payments.customer_id → users.id
provider_payouts.provider_id → providers.id
provider_payouts.payment_id → payments.id (nullable)
notifications.user_id → users.id
provider_documents.provider_id → providers.id
provider_documents.verified_by → users.id (nullable)
activity_logs.user_id → users.id (nullable)
search_logs.user_id → users.id (nullable)
search_logs.clicked_provider_id → providers.id (nullable)
import_jobs.created_by → users.id
```

### One-to-One Relationships
```
users ←→ providers (via user_id, UNIQUE)
bookings ←→ reviews (UNIQUE booking_id)
bookings ←→ payments (UNIQUE booking_id)
```

### One-to-Many Relationships
```
users → bookings (as customer)
users → bookings (as provider/cancelled_by)
users → notifications
users → activity_logs
users → search_logs
users → import_jobs (created_by)
providers → provider_services
providers → services
providers → provider_service_areas
providers → provider_availability
providers → provider_documents
providers → provider_payouts
providers → reviews
providers → payments
providers → bookings (as provider)
service_categories → provider_services
service_categories → services
service_categories → service_categories (self-join for hierarchy)
bookings → booking_status_history
bookings → reviews
bookings → payments (theoretically, but constrained to 1:1)
payments → provider_payouts
roles → permissions
```

### Self-Referential Relationships
```
service_categories.parent_id → service_categories.id
```

---

## Data Flow Diagrams

### Booking Lifecycle Flow
```
Customer Creates Booking
    │
    ▼
[BOOKINGS] (status: pending)
    │
    ├─► Trigger: Create notification to provider
    │
    ├─► Provider Reviews
    │
    ├─► [BOOKING_STATUS_HISTORY] Records: pending → confirmed
    │
    ├─► [BOOKINGS] (status: confirmed)
    │
    ├─► Customer Pays (Phase 2)
    │   └─► [PAYMENTS] (status: pending → completed)
    │
    ├─► Service Performed
    │
    ├─► [BOOKING_STATUS_HISTORY] Records: confirmed → in_progress
    │
    ├─► Service Completed
    │
    ├─► [BOOKING_STATUS_HISTORY] Records: in_progress → completed
    │
    ├─► [BOOKINGS] (status: completed, completed_at: NOW())
    │
    ├─► Customer Reviews Provider
    │   └─► [REVIEWS] (is_approved: false → admin reviews → true)
    │
    ├─► Provider Responds to Review
    │   └─► [REVIEWS] (provider_response, provider_responded_at)
    │
    └─► Update Provider Rating
        └─► [PROVIDERS] (rating: avg(reviews.rating), total_reviews++)
```

### Search & Analytics Flow
```
Customer Searches
    │
    ├─► Record in [SEARCH_LOGS]
    │   ├─ search_query
    │   ├─ filters_applied (JSONB)
    │   ├─ results_count
    │   └─ created_at
    │
    ├─► Customer Clicks Provider
    │   └─► [SEARCH_LOGS] Update clicked_provider_id, clicked_at
    │
    ├─► Aggregated to [DAILY_ANALYTICS]
    │   ├─ total_searches++
    │   ├─ Most searched services
    │   └─ Most viewed providers
    │
    └─► Admin Analytics Dashboard
        ├─ Search trends
        ├─ Customer patterns
        └─ Popular services
```

### Admin Audit Flow
```
Admin Action (Create/Update/Delete)
    │
    ├─► [ACTIVITY_LOGS] Records
    │   ├─ user_id (admin)
    │   ├─ action (created|updated|deleted|approved)
    │   ├─ entity_type (provider|booking|review|page)
    │   ├─ entity_id
    │   ├─ old_values (before change)
    │   ├─ new_values (after change)
    │   ├─ ip_address
    │   └─ user_agent
    │
    └─► Admin Can
        ├─ Approve/Reject Reviews → [REVIEWS].is_approved
        ├─ Manage Pages → [PAGES]
        ├─ Manage Banners → [BANNERS]
        ├─ Import Data → [IMPORT_JOBS]
        ├─ View Logs → [ACTIVITY_LOGS]
        └─ View Analytics → [DAILY_ANALYTICS]
```

---

## Query Performance Optimization Indexes

### Essential Indexes by Use Case

**Finding Available Providers by Location:**
```sql
CREATE INDEX idx_provider_service_areas_suburb 
  ON provider_service_areas(suburb, is_active);
```

**Finding Services in Category:**
```sql
CREATE INDEX idx_services_category_active 
  ON services(category_id, is_active);
```

**Booking Status Queries:**
```sql
CREATE INDEX idx_bookings_customer_status 
  ON bookings(customer_id, status);

CREATE INDEX idx_bookings_provider_status 
  ON bookings(provider_id, status, booking_date DESC);
```

**Payment Reconciliation:**
```sql
CREATE INDEX idx_payments_status_provider 
  ON payments(payment_status, provider_id, paid_at);
```

**Provider Performance Metrics:**
```sql
CREATE INDEX idx_reviews_provider_rating 
  ON reviews(provider_id, rating, is_approved);
```

**Date Range Queries:**
```sql
CREATE INDEX idx_bookings_date_range 
  ON bookings(booking_date, status);

CREATE INDEX idx_daily_analytics_date 
  ON daily_analytics(metric_date DESC);
```

---

## Migration Path from Old Schema

### Breaking Changes from Original

| Old Table | New Table(s) | Changes |
|-----------|-------------|---------|
| categories | service_categories | Added parent_id, is_hierarchical, deleted_at |
| services | services + provider_services | Split to create M:M relationship |
| users | users | Added email_verified_at, reset_token fields |
| bookings | bookings + booking_status_history | Added payment fields, history tracking |
| providers | providers | Added verification_date, rating constraints |
| N/A | reviews | Enhanced with is_approved (admin moderation) |
| N/A | payments | New table for Phase 2 readiness |
| N/A | provider_payouts | New table for commission tracking |
| notifications | notifications | Schema compatible, fields renamed |
| N/A | Many new tables | 13 new tables added |

### Migration Strategy

1. **Backup existing database**
2. **Run new schema with backward compatibility**
3. **Migrate data from old to new tables**
4. **Add new tables for new features**
5. **Update application code**
6. **Test thoroughly**
7. **Deploy to production**

---

## Summary

- **24 total tables** organized in 6 functional groups
- **40+ foreign keys** with cascading deletes and referential integrity
- **80+ indexes** for optimal query performance
- **Soft deletes** on all core entities for audit trail
- **Automatic timestamps** via triggers
- **JSONB fields** for flexible JSON storage (filters, old/new values)
- **CHECK constraints** for data validation
- **UNIQUE constraints** for business logic
- **Phase 2 Payment Ready:** Full schema designed and ready
- **RBAC Support:** Roles and Permissions tables for fine-grained access control
- **Analytics Ready:** Search logs and daily analytics tables
- **Audit Trail:** Complete activity logging for compliance

This schema is **production-ready** and supports all requirements outlined in the client review.
