# Entity Relationship Diagram (ERD) Documentation
**Database:** Services Marketplace  
**Date:** January 5, 2026  
**Total Tables:** 23  
**Total Relationships:** 42

---

## ERD Visual Overview (Text-Based)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SERVICES MARKETPLACE DATABASE                          │
│                                   ERD DIAGRAM                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                              CORE USER MANAGEMENT                                 │
└──────────────────────────────────────────────────────────────────────────────────┘

        ┌──────────┐
        │  roles   │
        │──────────│
        │ id (PK)  │
        │ name ◆   │
        └────┬─────┘
             │ 1
             │
             │ N
        ┌────▼──────────┐
        │ permissions   │
        │───────────────│
        │ id (PK)       │
        │ role_id (FK)  │
        │ resource      │
        │ action        │
        └───────────────┘

        ┌──────────────────────────────────┐
        │           users                  │
        │──────────────────────────────────│
        │ id (PK)                          │
        │ email ◆                          │
        │ password_hash                    │
        │ role ◆ (admin/provider/customer) │
        │ first_name                       │
        │ last_name                        │
        │ phone                            │
        │ is_active                        │
        │ is_approved                      │
        │ email_verified_at                │
        │ reset_token                      │
        │ last_login_at                    │
        │ created_at                       │
        │ updated_at                       │
        │ deleted_at                       │
        └────┬─────────────────────────────┘
             │ 1:1
             │
             │
        ┌────▼──────────────────────────────────┐
        │           providers                   │
        │───────────────────────────────────────│
        │ id (PK)                               │
        │ user_id (FK) ◆                        │
        │ business_name                         │
        │ business_description                  │
        │ business_logo                         │
        │ address                               │
        │ suburb                                │
        │ city, state, postal_code, country     │
        │ rating (0-5) ◆                        │
        │ total_reviews                         │
        │ total_bookings                        │
        │ is_verified                           │
        │ created_at, updated_at, deleted_at    │
        └────┬──────────────────────────────────┘
             │
             ├───────────────┐
             │               │
             │               │
    ┌────────▼──────┐   ┌────▼──────────────────┐
    │provider_      │   │provider_service_      │
    │service_areas  │   │areas                  │
    │───────────────│   │───────────────────────│
    │id (PK)        │   │id (PK)                │
    │provider_id(FK)│   │provider_id (FK)       │
    │suburb ◆       │   │suburb ◆               │
    │postcode       │   │postcode               │
    │is_active      │   │service_area_name      │
    └───────────────┘   │is_active              │
                        └───────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                         SERVICE CATALOG & CATEGORIES                              │
└──────────────────────────────────────────────────────────────────────────────────┘

        ┌────────────────────────────────────┐
        │     service_categories             │
        │────────────────────────────────────│
        │ id (PK)                            │
        │ name ◆                             │
        │ parent_id (FK) → self ⟲            │
        │ slug ◆                             │
        │ description                        │
        │ icon                               │
        │ is_active                          │
        │ display_order                      │
        │ created_at, updated_at, deleted_at │
        └────┬───────────────────────────────┘
             │ N
             │
             │ N     ┌─────────────────────┐
             └───────┤ provider_services   │ (JUNCTION TABLE)
                     │─────────────────────│
                 ┌───┤ id (PK)             │
                 │   │ provider_id (FK)    │───┐
                 │   │ category_id (FK)    │   │
                 │   │ custom_price        │   │
                 │   │ base_price          │   │
                 │   │ is_active           │   │
                 │   └─────────────────────┘   │
                 │                              │
                 │                              │ N
                 │ N                            │
            ┌────▼──────────────┐         ┌─────▼────────┐
            │   services        │         │  providers   │
            │───────────────────│         │──────────────│
            │ id (PK)           │         │ (see above)  │
            │ provider_id (FK)  │◄────────┤              │
            │ category_id (FK)  │         └──────────────┘
            │ name              │
            │ slug ◆            │
            │ description       │
            │ price             │
            │ duration          │
            │ is_active         │
            │ images[]          │
            └───────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                         BOOKING & AVAILABILITY MANAGEMENT                         │
└──────────────────────────────────────────────────────────────────────────────────┘

        ┌────────────────────────────────────┐
        │   provider_availability            │
        │────────────────────────────────────│
        │ id (PK)                            │
        │ provider_id (FK) → providers       │
        │ available_date                     │
        │ time_slot_start                    │
        │ time_slot_end                      │
        │ is_available                       │
        │ max_bookings_per_slot              │
        └────────────────────────────────────┘


        ┌─────────────────────────────────────────────────┐
        │                 bookings                        │
        │─────────────────────────────────────────────────│
        │ id (PK)                                         │
        │ customer_id (FK) → users                        │
        │ provider_id (FK) → providers                    │
        │ service_id (FK) → services                      │
        │ status ◆ (pending/confirmed/in_progress/        │
        │          completed/cancelled)                   │
        │ booking_date, booking_time                      │
        │ customer_name, email, phone                     │
        │ address, suburb                                 │
        │ notes                                           │
        │ total_price                                     │
        │ payment_status ◆                                │
        │ payment_id                                      │
        │ cancelled_by (FK) → users                       │
        │ cancellation_reason                             │
        │ completed_at                                    │
        │ created_at, updated_at, deleted_at              │
        └────┬────────────────────────────────────────────┘
             │ 1:1
             ├────────────────────────┐
             │                        │
             │                        │
    ┌────────▼──────────────┐   ┌────▼───────────────────────┐
    │booking_status_history │   │        reviews             │
    │───────────────────────│   │────────────────────────────│
    │id (PK)                │   │id (PK)                     │
    │booking_id (FK) ◆      │   │booking_id (FK) ◆           │
    │old_status             │   │provider_id (FK)            │
    │new_status             │   │customer_id (FK)            │
    │changed_by_user_id(FK) │   │rating ◆ (1-5)              │
    │notes                  │   │comment                     │
    │created_at             │   │provider_response           │
    └───────────────────────┘   │is_approved                 │
                                │created_at, updated_at      │
                                └────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                         PAYMENT & FINANCIAL MANAGEMENT                            │
└──────────────────────────────────────────────────────────────────────────────────┘

        ┌────────────────────────────────────────────┐
        │              payments                      │
        │────────────────────────────────────────────│
        │ id (PK)                                    │
        │ booking_id (FK) ◆ → bookings               │
        │ provider_id (FK) → providers               │
        │ customer_id (FK) → users                   │
        │ total_amount                               │
        │ commission_amount                          │
        │ provider_payout_amount                     │
        │ payment_gateway (stripe/razorpay/paypal)   │
        │ transaction_id ◆                           │
        │ payment_status ◆ (pending/completed/       │
        │                   failed/refunded)         │
        │ paid_at                                    │
        │ refunded_at                                │
        │ refund_reason                              │
        │ created_at, updated_at                     │
        └────┬───────────────────────────────────────┘
             │ 1:N
             │
             │
        ┌────▼────────────────────────────┐
        │    provider_payouts             │
        │─────────────────────────────────│
        │ id (PK)                         │
        │ provider_id (FK) → providers    │
        │ payment_id (FK)                 │
        │ total_earnings                  │
        │ commission_deducted             │
        │ payout_amount                   │
        │ payout_status ◆                 │
        │ payout_method                   │
        │ payout_date                     │
        │ notes                           │
        │ created_at, updated_at          │
        └─────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                         CMS & CONTENT MANAGEMENT                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

        ┌────────────────────────┐
        │       pages            │
        │────────────────────────│
        │ id (PK)                │
        │ slug ◆                 │
        │ title                  │
        │ content                │
        │ meta_title             │
        │ meta_description       │
        │ is_published           │
        │ published_at           │
        │ created_at, updated_at │
        │ deleted_at             │
        └────────────────────────┘

        ┌────────────────────────┐
        │      banners           │
        │────────────────────────│
        │ id (PK)                │
        │ title                  │
        │ image_url              │
        │ link_url               │
        │ position               │
        │ display_order          │
        │ is_active              │
        │ display_from           │
        │ display_to             │
        │ created_at, updated_at │
        └────────────────────────┘

        ┌────────────────────────┐
        │        faqs            │
        │────────────────────────│
        │ id (PK)                │
        │ question               │
        │ answer                 │
        │ category               │
        │ display_order          │
        │ is_active              │
        │ created_at, updated_at │
        └────────────────────────┘

        ┌────────────────────────┐
        │     blog_posts         │
        │────────────────────────│
        │ id (PK)                │
        │ title                  │
        │ slug ◆                 │
        │ content                │
        │ excerpt                │
        │ author_id (FK) → users │
        │ is_published           │
        │ created_at, updated_at │
        │ deleted_at             │
        └────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                         NOTIFICATIONS & COMMUNICATION                             │
└──────────────────────────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────┐
        │       notifications              │
        │──────────────────────────────────│
        │ id (PK)                          │
        │ user_id (FK) → users             │
        │ type ◆ (email/sms/push/in_app)   │
        │ subject                          │
        │ message                          │
        │ recipient                        │
        │ sent_at                          │
        │ read_at                          │
        │ created_at                       │
        │ deleted_at                       │
        └──────────────────────────────────┘

        ┌──────────────────────────────────┐
        │   system_notifications           │
        │──────────────────────────────────│
        │ id (PK)                          │
        │ title                            │
        │ message                          │
        │ notification_type                │
        │ recipient_type (all/providers/   │
        │                 customers)       │
        │ is_sent                          │
        │ sent_at                          │
        │ created_at, updated_at           │
        └──────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY & AUDIT TRAIL                                    │
└──────────────────────────────────────────────────────────────────────────────────┘

        ┌────────────────────────────────────┐
        │        activity_logs               │
        │────────────────────────────────────│
        │ id (PK)                            │
        │ user_id (FK) → users               │
        │ action                             │
        │ entity_type                        │
        │ entity_id                          │
        │ old_values (JSON)                  │
        │ new_values (JSON)                  │
        │ ip_address                         │
        │ user_agent                         │
        │ created_at                         │
        └────────────────────────────────────┘

        ┌────────────────────────────────────┐
        │    provider_documents              │
        │────────────────────────────────────│
        │ id (PK)                            │
        │ provider_id (FK) → providers       │
        │ document_type                      │
        │ file_path                          │
        │ is_verified                        │
        │ verified_by (FK) → users           │
        │ verified_at                        │
        │ rejection_reason                   │
        │ created_at                         │
        └────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                         ANALYTICS & REPORTING                                     │
└──────────────────────────────────────────────────────────────────────────────────┘

        ┌────────────────────────────────────┐
        │         search_logs                │
        │────────────────────────────────────│
        │ id (PK)                            │
        │ user_id (FK) → users               │
        │ search_query                       │
        │ filters_applied (JSON)             │
        │ results_count                      │
        │ clicked_provider_id (FK)→providers │
        │ clicked_at                         │
        │ created_at                         │
        └────────────────────────────────────┘

        ┌────────────────────────────────────┐
        │       daily_analytics              │
        │────────────────────────────────────│
        │ id (PK)                            │
        │ metric_date ◆                      │
        │ total_bookings                     │
        │ total_revenue                      │
        │ active_providers                   │
        │ active_customers                   │
        │ new_providers                      │
        │ new_customers                      │
        │ average_rating                     │
        │ total_searches                     │
        │ created_at                         │
        └────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                         OPERATIONAL TOOLS                                         │
└──────────────────────────────────────────────────────────────────────────────────┘

        ┌────────────────────────────────────┐
        │         import_jobs                │
        │────────────────────────────────────│
        │ id (PK)                            │
        │ import_type                        │
        │ file_url                           │
        │ status ◆ (pending/processing/      │
        │          completed/failed)         │
        │ total_rows                         │
        │ rows_processed                     │
        │ rows_failed                        │
        │ error_log (JSON)                   │
        │ created_by (FK) → users            │
        │ completed_at                       │
        │ created_at, updated_at             │
        └────────────────────────────────────┘

        ┌────────────────────────────────────┐
        │         commissions                │
        │────────────────────────────────────│
        │ id (PK)                            │
        │ name                               │
        │ commission_type (percentage/fixed) │
        │ amount                             │
        │ description                        │
        │ is_active                          │
        │ created_at, updated_at, deleted_at │
        └────────────────────────────────────┘
```

---

## Relationship Legend

- `◆` = UNIQUE constraint
- `(PK)` = Primary Key
- `(FK)` = Foreign Key
- `→` = References/Points to
- `⟲` = Self-referencing (hierarchical)
- `1:1` = One-to-One relationship
- `1:N` = One-to-Many relationship
- `N:M` = Many-to-Many relationship (requires junction table)

---

## Key Relationship Patterns

### 1. User → Provider (1:1)
```
users.id ←→ providers.user_id
```
Every provider has exactly one user account.

### 2. Provider → Services (1:N)
```
providers.id ← services.provider_id
```
One provider can offer many services.

### 3. Provider ↔ Categories (N:M)
```
providers.id ← provider_services.provider_id
service_categories.id ← provider_services.category_id
```
Providers can offer multiple categories; categories can have multiple providers.

### 4. Booking Lifecycle
```
bookings.id → booking_status_history (1:N)
bookings.id → reviews (1:1)
bookings.id → payments (1:1)
```

### 5. Payment Flow
```
bookings → payments → provider_payouts
customer pays → platform receives → provider gets paid
```

---

## Cardinality Summary

| Parent Table | Child Table | Relationship | Constraint |
|--------------|-------------|--------------|------------|
| users | providers | 1:1 | UNIQUE on user_id |
| users | bookings | 1:N | CASCADE delete |
| providers | bookings | 1:N | CASCADE delete |
| bookings | reviews | 1:1 | UNIQUE on booking_id |
| bookings | payments | 1:1 | UNIQUE on booking_id |
| providers | services | 1:N | CASCADE delete |
| service_categories | service_categories | 1:N | Self-reference |
| providers ↔ service_categories | provider_services | N:M | Junction table |

---

## Index Coverage Map

### Heavily Indexed Tables (6+ indexes)
1. **users** - 4 indexes (email, role, is_active, created_at)
2. **providers** - 4 indexes (user_id, suburb, rating, created_at)
3. **bookings** - 6 indexes (customer, provider, status, payment_status, date, created_at)
4. **reviews** - 5 indexes (provider, customer, booking, rating, is_approved)
5. **payments** - 5 indexes (booking, provider, customer, status, transaction_id)

### Moderately Indexed Tables (2-5 indexes)
- service_categories (3 indexes)
- services (4 indexes)
- provider_service_areas (2 indexes)
- provider_availability (2 indexes)
- notifications (3 indexes)
- activity_logs (3 indexes)
- search_logs (3 indexes)

---

## Data Flow Diagrams

### Customer Booking Flow
```
1. Customer searches → search_logs
2. Customer creates booking → bookings
3. Booking status change → booking_status_history
4. Payment processed → payments
5. Service completed → bookings.status = 'completed'
6. Customer reviews → reviews
7. Provider gets paid → provider_payouts
```

### Provider Onboarding Flow
```
1. Register → users (role = 'provider')
2. Create profile → providers
3. Upload documents → provider_documents
4. Admin verifies → provider_documents.is_verified = true
5. Add services → provider_services
6. Set availability → provider_availability
7. Define service areas → provider_service_areas
8. Start receiving bookings
```

### Admin Moderation Flow
```
1. Admin reviews provider → provider_documents
2. Approves/rejects → users.is_approved
3. Moderates reviews → reviews.is_approved
4. Manages content → pages, banners, faqs
5. Tracks activity → activity_logs
6. Views analytics → daily_analytics
```

---

**Legend:**
- All tables have standard fields: `created_at`, `updated_at`, `deleted_at` (soft delete)
- UUID used for all primary keys
- Triggers automatically update `updated_at` on row changes
- Foreign keys enforce referential integrity with CASCADE or SET NULL

**Generated:** January 5, 2026  
**Schema Version:** 1.0 (Production Ready)
