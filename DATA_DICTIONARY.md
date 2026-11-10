# Database Data Dictionary
## Services Marketplace Platform - Complete Schema Documentation
**Last Updated:** January 5, 2026

---

## Table of Contents
1. [Table Overview](#table-overview)
2. [Detailed Table Documentation](#detailed-table-documentation)
3. [Foreign Key Relationships](#foreign-key-relationships)
4. [Indexes Strategy](#indexes-strategy)
5. [Constraints & Validation](#constraints--validation)

---

## Table Overview

| # | Table Name | Purpose | Type |
|---|------------|---------|------|
| 1 | `roles` | Define user roles (Admin, Provider, Customer) | RBAC |
| 2 | `permissions` | Define permissions per role | RBAC |
| 3 | `users` | User accounts (all roles) | Core |
| 4 | `providers` | Provider business profiles | Core |
| 5 | `service_categories` | Service categories (hierarchical) | Core |
| 6 | `categories` | Legacy category table (deprecated) | Core |
| 7 | `provider_services` | Many-to-Many: Provider ↔ Service Category | Junction |
| 8 | `services` | Individual service offerings | Core |
| 9 | `provider_service_areas` | Suburbs/locations served by provider | Core |
| 10 | `provider_availability` | Provider availability scheduling | Operational |
| 11 | `bookings` | Service bookings | Core |
| 12 | `booking_status_history` | Booking lifecycle audit trail | Audit |
| 13 | `reviews` | Customer/Provider reviews | Core |
| 14 | `payments` | Payment transactions | Financial |
| 15 | `provider_payouts` | Provider earnings & payouts | Financial |
| 16 | `notifications` | Email/SMS/Push notifications | Operational |
| 17 | `pages` | CMS dynamic content | CMS |
| 18 | `banners` | Promotional banners | CMS |
| 19 | `faqs` | Frequently asked questions | CMS |
| 20 | `activity_logs` | Admin audit trail | Security |
| 21 | `search_logs` | Search analytics | Analytics |
| 22 | `provider_documents` | Verification documents | Operational |
| 23 | `import_jobs` | Bulk CSV import tracking | Operational |
| 24 | `daily_analytics` | Performance metrics | Analytics |

---

## Detailed Table Documentation

### TABLE 1: ROLES
**Purpose:** Define user roles with permissions for role-based access control

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique role identifier |
| name | VARCHAR(50) | NO | - | UNIQUE | Role name (admin, provider, customer) |
| description | TEXT | YES | - | - | Role description |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Record creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |

**Indexes:** 
- PRIMARY KEY: id

---

### TABLE 2: PERMISSIONS
**Purpose:** Define what each role can do (RBAC - Resource-Action mapping)

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique permission identifier |
| role_id | UUID | NO | - | FK(roles.id, CASCADE) | Role this permission belongs to |
| resource | VARCHAR(100) | NO | - | - | Resource name (booking, provider, review, etc.) |
| action | VARCHAR(50) | NO | - | - | Action (create, read, update, delete) |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Record creation time |

**Constraints:**
- UNIQUE(role_id, resource, action) - One permission per role-resource-action

**Indexes:**
- PRIMARY KEY: id
- FK: role_id

---

### TABLE 3: USERS
**Purpose:** Store user accounts for all roles (Admin, Provider, Customer)

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | NO | - | UNIQUE | User email (login credential) |
| password_hash | VARCHAR(255) | NO | - | - | Hashed password (never plaintext) |
| role | VARCHAR(20) | NO | - | CHECK(IN admin, provider, customer) | User role |
| first_name | VARCHAR(100) | NO | - | - | User first name |
| last_name | VARCHAR(100) | NO | - | - | User last name |
| phone | VARCHAR(20) | YES | - | - | Contact phone number |
| is_active | BOOLEAN | NO | true | - | Account active status |
| is_approved | BOOLEAN | NO | false | - | Admin approval status |
| email_verified_at | TIMESTAMP | YES | - | - | Email verification timestamp |
| reset_token | VARCHAR(255) | YES | - | - | Password reset token |
| reset_token_expires_at | TIMESTAMP | YES | - | - | Reset token expiration time |
| last_login_at | TIMESTAMP | YES | - | - | Last login timestamp |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Account creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |
| deleted_at | TIMESTAMP | YES | - | - | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: email
- INDEX: role, is_active, created_at

---

### TABLE 4: PROVIDERS
**Purpose:** Store provider business profile information

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique provider identifier |
| user_id | UUID | NO | - | UNIQUE, FK(users.id, CASCADE) | Reference to user account |
| business_name | VARCHAR(255) | NO | - | - | Provider business name |
| business_description | TEXT | YES | - | - | Business description |
| business_logo | VARCHAR(500) | YES | - | - | Logo URL (S3/CDN) |
| address | TEXT | YES | - | - | Business physical address |
| suburb | VARCHAR(100) | YES | - | - | Suburb/locality |
| city | VARCHAR(100) | YES | - | - | City |
| state | VARCHAR(100) | YES | - | - | State/Province |
| postal_code | VARCHAR(20) | YES | - | - | Postal code |
| country | VARCHAR(100) | NO | India | - | Country |
| rating | DECIMAL(3,2) | NO | 0.00 | CHECK(0-5) | Average rating (1-5 stars) |
| total_reviews | INTEGER | NO | 0 | - | Total review count |
| total_bookings | INTEGER | NO | 0 | - | Total booking count |
| is_verified | BOOLEAN | NO | false | - | Provider verification status |
| verification_date | TIMESTAMP | YES | - | - | Verification timestamp |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Profile creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |
| deleted_at | TIMESTAMP | YES | - | - | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: user_id
- INDEX: suburb, rating DESC, created_at

---

### TABLE 5: SERVICE_CATEGORIES
**Purpose:** Store service categories with hierarchical support (parent-child)

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique category identifier |
| name | VARCHAR(255) | NO | - | UNIQUE | Category name |
| parent_id | UUID | YES | - | FK(self, SET NULL) | Parent category (for hierarchy) |
| slug | VARCHAR(255) | NO | - | UNIQUE | URL-friendly slug |
| description | TEXT | YES | - | - | Category description |
| icon | VARCHAR(500) | YES | - | - | Icon URL (S3/CDN) |
| is_active | BOOLEAN | NO | true | - | Active status |
| display_order | INTEGER | NO | 0 | - | Sort order |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |
| deleted_at | TIMESTAMP | YES | - | - | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: name, slug
- INDEX: parent_id, is_active

---

### TABLE 6: CATEGORIES (DEPRECATED)
**Purpose:** Legacy category table - use service_categories instead

*See TABLE 5 for structure. Kept for backward compatibility.*

---

### TABLE 7: PROVIDER_SERVICES
**Purpose:** Many-to-Many junction table: Provider ↔ Service Category

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique relationship identifier |
| provider_id | UUID | NO | - | FK(providers.id, CASCADE) | Provider reference |
| category_id | UUID | NO | - | FK(service_categories.id, CASCADE) | Service category reference |
| custom_price | DECIMAL(10,2) | YES | - | - | Custom price for this provider-service |
| base_price | DECIMAL(10,2) | YES | - | - | Base price |
| description | TEXT | YES | - | - | Service description |
| is_active | BOOLEAN | NO | true | - | Active status |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |

**Constraints:**
- UNIQUE(provider_id, category_id) - Each provider offers each category once

**Indexes:**
- PRIMARY KEY: id
- FK: provider_id, category_id
- INDEX: provider_id, category_id

---

### TABLE 8: SERVICES
**Purpose:** Individual service offerings by providers

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique service identifier |
| provider_id | UUID | YES | - | FK(providers.id, CASCADE) | Provider offering service |
| category_id | UUID | YES | - | FK(service_categories.id, SET NULL) | Service category |
| name | VARCHAR(255) | NO | - | - | Service name |
| slug | VARCHAR(255) | NO | - | - | URL-friendly slug |
| description | TEXT | YES | - | - | Service description |
| price | DECIMAL(10,2) | YES | - | - | Service price |
| duration | INTEGER | YES | - | - | Duration in minutes |
| is_active | BOOLEAN | NO | true | - | Active status |
| images | TEXT[] | YES | - | - | Array of image URLs |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |
| deleted_at | TIMESTAMP | YES | - | - | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY: id
- FK: provider_id, category_id
- INDEX: slug, is_active

---

### TABLE 9: PROVIDER_SERVICE_AREAS
**Purpose:** Define which suburbs/locations each provider operates in

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique service area identifier |
| provider_id | UUID | NO | - | FK(providers.id, CASCADE) | Provider reference |
| suburb | VARCHAR(100) | NO | - | - | Suburb name (e.g., Ponsonby) |
| postcode | VARCHAR(20) | YES | - | - | Postal code |
| service_area_name | VARCHAR(255) | YES | - | - | Descriptive area name |
| is_active | BOOLEAN | NO | true | - | Active status |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |

**Indexes:**
- PRIMARY KEY: id
- FK: provider_id
- INDEX: provider_id, suburb

---

### TABLE 10: PROVIDER_AVAILABILITY
**Purpose:** Store provider availability for booking scheduling

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique availability slot |
| provider_id | UUID | NO | - | FK(providers.id, CASCADE) | Provider reference |
| available_date | DATE | NO | - | - | Available date |
| time_slot_start | TIME | NO | - | - | Time slot start time |
| time_slot_end | TIME | NO | - | - | Time slot end time |
| is_available | BOOLEAN | NO | true | - | Availability status |
| max_bookings_per_slot | INTEGER | NO | 1 | - | Max concurrent bookings |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |

**Constraints:**
- CHECK(time_slot_start < time_slot_end) - Valid time range

**Indexes:**
- PRIMARY KEY: id
- FK: provider_id
- INDEX: provider_id, available_date

---

### TABLE 11: BOOKINGS
**Purpose:** Service bookings - core transaction table

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique booking identifier |
| customer_id | UUID | NO | - | FK(users.id, CASCADE) | Customer reference |
| provider_id | UUID | NO | - | FK(providers.id, CASCADE) | Provider reference |
| service_id | UUID | YES | - | FK(services.id, SET NULL) | Service reference |
| status | VARCHAR(20) | NO | pending | CHECK(IN pending, confirmed, in_progress, completed, cancelled, rejected) | Booking status |
| booking_date | DATE | NO | - | - | Date of service |
| booking_time | TIME | YES | - | - | Time of service |
| customer_name | VARCHAR(200) | NO | - | - | Customer name |
| customer_email | VARCHAR(255) | NO | - | - | Customer email |
| customer_phone | VARCHAR(20) | NO | - | - | Customer phone |
| address | TEXT | YES | - | - | Service address |
| suburb | VARCHAR(100) | YES | - | - | Service suburb |
| notes | TEXT | YES | - | - | Additional notes |
| total_price | DECIMAL(10,2) | YES | - | - | Booking price |
| payment_status | VARCHAR(50) | NO | pending | CHECK(IN pending, completed, failed, refunded) | Payment status |
| payment_id | UUID | YES | - | FK(payments.id) | Reference to payment record |
| cancelled_by | UUID | YES | - | FK(users.id, SET NULL) | User who cancelled |
| cancellation_reason | TEXT | YES | - | - | Cancellation reason |
| completed_at | TIMESTAMP | YES | - | - | Completion timestamp |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |
| deleted_at | TIMESTAMP | YES | - | - | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY: id
- FK: customer_id, provider_id, service_id, payment_id
- INDEX: status, payment_status, booking_date, created_at

---

### TABLE 12: BOOKING_STATUS_HISTORY
**Purpose:** Audit trail for booking lifecycle transitions

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique history record |
| booking_id | UUID | NO | - | FK(bookings.id, CASCADE) | Booking reference |
| old_status | VARCHAR(50) | YES | - | - | Previous status |
| new_status | VARCHAR(50) | NO | - | - | New status |
| changed_by_user_id | UUID | YES | - | FK(users.id, SET NULL) | User who made change (admin/provider) |
| notes | TEXT | YES | - | - | Change notes |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Change timestamp |

**Purpose:** Enables:
- Booking lifecycle tracking (Pending → Confirmed → In-Progress → Completed)
- Admin override capability for disputes
- History viewing and compliance

**Indexes:**
- PRIMARY KEY: id
- FK: booking_id, changed_by_user_id
- INDEX: booking_id, created_at

---

### TABLE 13: REVIEWS
**Purpose:** Customer & Provider reviews after service completion

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique review identifier |
| booking_id | UUID | NO | - | UNIQUE, FK(bookings.id, CASCADE) | Booking reference (one review per booking) |
| provider_id | UUID | NO | - | FK(providers.id, CASCADE) | Provider being reviewed |
| customer_id | UUID | NO | - | FK(users.id, CASCADE) | Customer who reviewed |
| rating | INTEGER | NO | - | CHECK(1-5) | Rating: 1-5 stars |
| comment | TEXT | YES | - | - | Review comment |
| provider_response | TEXT | YES | - | - | Provider response to review |
| provider_responded_at | TIMESTAMP | YES | - | - | Response timestamp |
| is_approved | BOOLEAN | NO | false | - | Admin approval status |
| is_hidden | BOOLEAN | NO | false | - | Hidden status |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |
| deleted_at | TIMESTAMP | YES | - | - | Soft delete timestamp |

**Purpose:**
- Admin moderation controls (approve/reject)
- Ratings displayed on provider profile
- Both customer→provider reviews supported

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: booking_id
- FK: provider_id, customer_id, booking_id
- INDEX: rating, is_approved

---

### TABLE 14: PAYMENTS
**Purpose:** Payment transaction records (Phase 2 - but schema designed now)

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique payment identifier |
| booking_id | UUID | NO | - | UNIQUE, FK(bookings.id, CASCADE) | Booking reference |
| provider_id | UUID | NO | - | FK(providers.id, CASCADE) | Provider receiving payment |
| customer_id | UUID | NO | - | FK(users.id, CASCADE) | Customer making payment |
| total_amount | DECIMAL(10,2) | NO | - | - | Total transaction amount |
| commission_amount | DECIMAL(10,2) | YES | 0 | - | Platform commission |
| provider_payout_amount | DECIMAL(10,2) | YES | - | - | Amount paid to provider |
| payment_gateway | VARCHAR(50) | YES | - | - | Gateway used (stripe, razorpay, paypal) |
| transaction_id | VARCHAR(255) | YES | - | UNIQUE | External gateway transaction ID |
| payment_status | VARCHAR(50) | NO | pending | CHECK(IN pending, completed, failed, refunded) | Payment status |
| paid_at | TIMESTAMP | YES | - | - | Payment completion timestamp |
| refunded_at | TIMESTAMP | YES | - | - | Refund timestamp |
| refund_reason | TEXT | YES | - | - | Refund reason |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |

**CRITICAL:** Even though payments are Phase 2, this schema is designed and ready NOW. When Phase 2 starts, only configuration and UI are needed - NO database refactoring required.

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: booking_id, transaction_id
- FK: booking_id, provider_id, customer_id
- INDEX: payment_status, paid_at

---

### TABLE 15: PROVIDER_PAYOUTS
**Purpose:** Track commission model and provider payout history

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique payout record |
| provider_id | UUID | NO | - | FK(providers.id, CASCADE) | Provider reference |
| payment_id | UUID | YES | - | FK(payments.id, SET NULL) | Linked payment record |
| total_earnings | DECIMAL(10,2) | YES | - | - | Total earnings |
| commission_deducted | DECIMAL(10,2) | YES | - | - | Commission amount deducted |
| payout_amount | DECIMAL(10,2) | YES | - | - | Amount to be paid to provider |
| payout_status | VARCHAR(50) | NO | pending | CHECK(IN pending, processed, cancelled) | Payout status |
| payout_method | VARCHAR(50) | YES | - | - | Payment method (bank_transfer, check, wallet) |
| payout_date | TIMESTAMP | YES | - | - | Payout execution date |
| notes | TEXT | YES | - | - | Payout notes |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |

**Indexes:**
- PRIMARY KEY: id
- FK: provider_id, payment_id
- INDEX: provider_id, payout_status

---

### TABLE 16: NOTIFICATIONS
**Purpose:** Email, SMS, and push notification queue and history

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique notification identifier |
| user_id | UUID | NO | - | FK(users.id, CASCADE) | Recipient user |
| type | VARCHAR(50) | NO | - | CHECK(IN email, sms, push_notification, in_app) | Notification type |
| subject | VARCHAR(255) | YES | - | - | Email subject |
| message | TEXT | NO | - | - | Notification message |
| recipient | VARCHAR(255) | YES | - | - | Email or phone number |
| sent_at | TIMESTAMP | YES | - | - | Send timestamp |
| read_at | TIMESTAMP | YES | - | - | Read timestamp |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| deleted_at | TIMESTAMP | YES | - | - | Soft delete timestamp |

**Purpose:**
- Track all booking status change notifications
- System alerts and emails
- Newsletter/promotional notifications
- Retry queue for failed sends

**Indexes:**
- PRIMARY KEY: id
- FK: user_id
- INDEX: user_id, sent_at, created_at

---

### TABLE 17: PAGES (CMS)
**Purpose:** Dynamic content management - About, FAQ, Terms, Privacy, Contact

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique page identifier |
| slug | VARCHAR(255) | NO | - | UNIQUE | URL slug (about, faq, terms, privacy, contact) |
| title | VARCHAR(255) | NO | - | - | Page title |
| content | TEXT | NO | - | - | Page content (HTML or markdown) |
| meta_title | VARCHAR(255) | YES | - | - | SEO meta title |
| meta_description | VARCHAR(500) | YES | - | - | SEO meta description |
| is_published | BOOLEAN | NO | false | - | Publication status |
| published_at | TIMESTAMP | YES | - | - | Publication timestamp |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |
| deleted_at | TIMESTAMP | YES | - | - | Soft delete timestamp |

**Purpose:**
- Admin can edit pages without coding
- SEO-friendly meta tags
- Draft and publish workflow

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: slug
- INDEX: slug, is_published

---

### TABLE 18: BANNERS
**Purpose:** Homepage and promotional banners managed by admin

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique banner identifier |
| title | VARCHAR(255) | NO | - | - | Banner title |
| image_url | VARCHAR(500) | NO | - | - | Banner image URL (S3/CDN) |
| link_url | VARCHAR(500) | YES | - | - | Banner link URL |
| position | VARCHAR(100) | YES | - | - | Display position (homepage_top, bottom, category_page, sidebar) |
| display_order | INTEGER | NO | 0 | - | Sort order |
| is_active | BOOLEAN | NO | true | - | Active status |
| display_from | DATE | YES | - | - | Start display date |
| display_to | DATE | YES | - | - | End display date |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |

**Purpose:**
- Admin add/edit/delete banners
- Schedule banners by date ranges
- Control placement and order

**Indexes:**
- PRIMARY KEY: id
- INDEX: is_active, position

---

### TABLE 19: FAQs
**Purpose:** Frequently asked questions managed by admin

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique FAQ identifier |
| question | VARCHAR(500) | NO | - | - | FAQ question |
| answer | TEXT | NO | - | - | FAQ answer (HTML or markdown) |
| category | VARCHAR(100) | YES | - | - | Category (Booking, Payments, Account, General) |
| display_order | INTEGER | NO | 0 | - | Sort order |
| is_active | BOOLEAN | NO | true | - | Active status |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |

**Indexes:**
- PRIMARY KEY: id
- INDEX: category, display_order

---

### TABLE 20: ACTIVITY_LOGS
**Purpose:** Security and admin monitoring - comprehensive audit trail

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique log entry |
| user_id | UUID | YES | - | FK(users.id, SET NULL) | User performing action |
| action | VARCHAR(100) | NO | - | - | Action (created, updated, deleted, approved, etc.) |
| entity_type | VARCHAR(50) | YES | - | - | Entity type (provider, booking, review, page, etc.) |
| entity_id | UUID | YES | - | - | ID of entity being changed |
| old_values | JSONB | YES | - | - | Previous values (what changed) |
| new_values | JSONB | YES | - | - | New values (what it changed to) |
| ip_address | VARCHAR(45) | YES | - | - | Request IP address |
| user_agent | TEXT | YES | - | - | Request user agent |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Log timestamp |

**Purpose:**
- Comprehensive audit trail for admin actions
- Track login attempts and security events
- Enable compliance and dispute resolution

**Indexes:**
- PRIMARY KEY: id
- FK: user_id
- INDEX: user_id, entity_type, created_at

---

### TABLE 21: SEARCH_LOGS
**Purpose:** Track search queries for analytics - identify trends and patterns

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique search log |
| user_id | UUID | YES | - | FK(users.id, SET NULL) | Searching user |
| search_query | VARCHAR(500) | YES | - | - | Search query string |
| filters_applied | JSONB | YES | - | - | Applied filters (category, suburb, rating, price range) |
| results_count | INTEGER | YES | - | - | Number of results returned |
| clicked_provider_id | UUID | YES | - | FK(providers.id, SET NULL) | Provider clicked in results |
| clicked_at | TIMESTAMP | YES | - | - | Click timestamp |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Search timestamp |

**Purpose:**
- Populates admin analytics dashboard
- Identify most-searched services
- Identify most-viewed providers
- Understand customer search patterns

**Indexes:**
- PRIMARY KEY: id
- FK: user_id, clicked_provider_id
- INDEX: created_at

---

### TABLE 22: PROVIDER_DOCUMENTS
**Purpose:** Store verification documents for providers

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique document identifier |
| provider_id | UUID | NO | - | FK(providers.id, CASCADE) | Provider reference |
| document_type | VARCHAR(50) | NO | - | - | Document type (business_license, insurance, id_proof) |
| file_path | VARCHAR(500) | NO | - | - | File path/URL |
| is_verified | BOOLEAN | NO | false | - | Verification status |
| verified_by | UUID | YES | - | FK(users.id, SET NULL) | Admin who verified |
| verified_at | TIMESTAMP | YES | - | - | Verification timestamp |
| rejection_reason | TEXT | YES | - | - | Rejection reason if denied |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Upload timestamp |

**Indexes:**
- PRIMARY KEY: id
- FK: provider_id, verified_by

---

### TABLE 23: IMPORT_JOBS
**Purpose:** Track bulk CSV import operations

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique import job |
| import_type | VARCHAR(50) | NO | - | - | Type of import (providers, services, categories) |
| file_url | VARCHAR(500) | NO | - | - | Uploaded file URL |
| status | VARCHAR(50) | NO | pending | CHECK(IN pending, processing, completed, failed) | Import status |
| total_rows | INTEGER | YES | - | - | Total rows in file |
| rows_processed | INTEGER | NO | 0 | - | Rows successfully processed |
| rows_failed | INTEGER | NO | 0 | - | Rows failed |
| error_log | JSONB | YES | - | - | Error details |
| created_by | UUID | NO | - | FK(users.id, CASCADE) | Admin initiating import |
| completed_at | TIMESTAMP | YES | - | - | Completion timestamp |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Last update time |

**Indexes:**
- PRIMARY KEY: id
- FK: created_by
- INDEX: status, created_at

---

### TABLE 24: DAILY_ANALYTICS
**Purpose:** Aggregate performance metrics for dashboard

| Field | Type | NULL | Default | Constraints | Purpose |
|-------|------|------|---------|-------------|---------|
| id | UUID | NO | uuid_generate_v4() | PRIMARY KEY | Unique analytics record |
| metric_date | DATE | NO | - | UNIQUE | Date of metrics |
| total_bookings | INTEGER | NO | 0 | - | Total bookings on date |
| total_revenue | DECIMAL(12,2) | NO | 0 | - | Total revenue on date |
| active_providers | INTEGER | NO | 0 | - | Active providers count |
| active_customers | INTEGER | NO | 0 | - | Active customers count |
| new_providers | INTEGER | NO | 0 | - | New providers on date |
| new_customers | INTEGER | NO | 0 | - | New customers on date |
| average_rating | DECIMAL(3,2) | YES | - | - | Average rating on date |
| total_searches | INTEGER | NO | 0 | - | Total searches on date |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Record creation |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: metric_date
- INDEX: metric_date

---

## Foreign Key Relationships

### Relationship Matrix

| From Table | FK Column | To Table | On Delete | On Update | Purpose |
|-----------|-----------|----------|-----------|-----------|---------|
| permissions | role_id | roles | CASCADE | RESTRICT | Role definition |
| users | - | - | - | - | Base user entity |
| providers | user_id | users | CASCADE | RESTRICT | Provider accounts |
| service_categories | parent_id | service_categories | SET NULL | RESTRICT | Category hierarchy |
| provider_services | provider_id | providers | CASCADE | RESTRICT | Service offerings |
| provider_services | category_id | service_categories | CASCADE | RESTRICT | Service offerings |
| services | provider_id | providers | CASCADE | RESTRICT | Services |
| services | category_id | service_categories | SET NULL | RESTRICT | Services |
| provider_service_areas | provider_id | providers | CASCADE | RESTRICT | Service areas |
| provider_availability | provider_id | providers | CASCADE | RESTRICT | Availability |
| bookings | customer_id | users | CASCADE | RESTRICT | Booking parties |
| bookings | provider_id | providers | CASCADE | RESTRICT | Booking parties |
| bookings | service_id | services | SET NULL | RESTRICT | Booking service |
| bookings | payment_id | payments | SET NULL | RESTRICT | Payment link |
| bookings | cancelled_by | users | SET NULL | RESTRICT | Audit trail |
| booking_status_history | booking_id | bookings | CASCADE | RESTRICT | Audit trail |
| booking_status_history | changed_by_user_id | users | SET NULL | RESTRICT | Audit trail |
| reviews | booking_id | bookings | CASCADE | RESTRICT | One per booking |
| reviews | provider_id | providers | CASCADE | RESTRICT | Reviews |
| reviews | customer_id | users | CASCADE | RESTRICT | Reviews |
| payments | booking_id | bookings | CASCADE | RESTRICT | One per booking |
| payments | provider_id | providers | CASCADE | RESTRICT | Payments |
| payments | customer_id | users | CASCADE | RESTRICT | Payments |
| provider_payouts | provider_id | providers | CASCADE | RESTRICT | Payouts |
| provider_payouts | payment_id | payments | SET NULL | RESTRICT | Payouts |
| notifications | user_id | users | CASCADE | RESTRICT | Notifications |
| activity_logs | user_id | users | SET NULL | RESTRICT | Audit trail |
| search_logs | user_id | users | SET NULL | RESTRICT | Analytics |
| search_logs | clicked_provider_id | providers | SET NULL | RESTRICT | Analytics |
| provider_documents | provider_id | providers | CASCADE | RESTRICT | Documents |
| provider_documents | verified_by | users | SET NULL | RESTRICT | Documents |
| import_jobs | created_by | users | CASCADE | RESTRICT | Import tracking |

---

## Indexes Strategy

### Performance-Critical Indexes (MUST BE CREATED)

**Search & Filtering:**
- service_categories.slug, name
- services.slug, name
- provider_service_areas.suburb
- providers.suburb
- providers.rating DESC

**Lookups:**
- All Foreign Keys (for JOIN operations)

**Date Queries:**
- created_at on all tables
- booking_date, booking_time on bookings
- available_date on provider_availability

**Status Queries:**
- booking_status, payment_status on bookings
- payout_status on provider_payouts
- import_status on import_jobs
- is_active on all entities
- is_published on pages

### Composite Indexes (For Common Query Patterns)

```sql
-- Find available slots for provider on date
idx_provider_availability_provider_date(provider_id, available_date)

-- Find bookings by provider and status
idx_bookings_provider_status(provider_id, status)

-- Find completed payments
idx_payments_status_date(payment_status, paid_at)
```

---

## Constraints & Validation

### CHECK Constraints

| Table | Field | Constraint | Values |
|-------|-------|-----------|--------|
| users | role | IN | 'admin', 'provider', 'customer' |
| providers | rating | BETWEEN | 0.00 - 5.00 |
| bookings | status | IN | 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected' |
| bookings | payment_status | IN | 'pending', 'completed', 'failed', 'refunded' |
| reviews | rating | BETWEEN | 1 - 5 |
| notifications | type | IN | 'email', 'sms', 'push_notification', 'in_app' |
| payments | payment_status | IN | 'pending', 'completed', 'failed', 'refunded' |
| provider_payouts | payout_status | IN | 'pending', 'processed', 'cancelled' |
| provider_availability | time_slot_start < time_slot_end | - | - |
| import_jobs | status | IN | 'pending', 'processing', 'completed', 'failed' |

### UNIQUE Constraints

| Table | Field(s) | Purpose |
|-------|----------|---------|
| roles | name | One role type |
| users | email | One account per email |
| providers | user_id | One profile per user |
| service_categories | name, slug | Unique categories |
| provider_services | provider_id, category_id | No duplicates |
| reviews | booking_id | One review per booking |
| payments | booking_id, transaction_id | One payment per booking |
| pages | slug | One page per slug |
| daily_analytics | metric_date | One record per day |

### NOT NULL Constraints

**Critical NOT NULL Fields:**

| Table | Fields | Reason |
|-------|--------|--------|
| users | email, password_hash, role, first_name, last_name | Required for login/identity |
| providers | user_id, business_name | Required for business |
| bookings | customer_id, provider_id, booking_date, customer_name, customer_email, customer_phone | Required for booking |
| reviews | booking_id, provider_id, customer_id, rating | Required for review |
| payments | booking_id, provider_id, customer_id, total_amount, payment_status | Required for payment |
| notifications | user_id, type, message | Required for notification |
| service_categories | name, slug | Required for category |
| pages | slug, title, content | Required for CMS |

---

## Standard Fields in All Tables

Every table includes:

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| created_at | TIMESTAMP | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | CURRENT_TIMESTAMP | Last modification timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete flag (nullable) |

**Triggers:** Automatic updates to `updated_at` on every row modification via `update_updated_at_column()` function.

---

## Enum Values to Define

### BookingStatus
- `pending` - Initial state when customer requests booking
- `confirmed` - Provider confirms the booking
- `in_progress` - Service is being performed
- `completed` - Service completed successfully
- `cancelled` - Booking cancelled by either party
- `rejected` - Provider rejected booking

### PaymentStatus
- `pending` - Payment awaiting processing
- `completed` - Payment processed successfully
- `failed` - Payment processing failed
- `refunded` - Payment refunded to customer

### NotificationType
- `email` - Email notification
- `sms` - SMS text message
- `push_notification` - Mobile push notification
- `in_app` - In-app notification

### UserRole
- `admin` - System administrator
- `provider` - Service provider
- `customer` - Service customer

### PayoutStatus
- `pending` - Payout awaiting processing
- `processed` - Payout completed
- `cancelled` - Payout cancelled

### ImportStatus
- `pending` - Import queued
- `processing` - Import in progress
- `completed` - Import successful
- `failed` - Import failed

---

## Summary Statistics

- **Total Tables:** 24
- **Core Tables:** 12
- **Junction Tables:** 1
- **CMS Tables:** 3
- **Financial Tables:** 2
- **Audit/Analytics Tables:** 4
- **Operational Tables:** 2
- **Total Indexes:** 80+
- **Total Foreign Keys:** 40+
- **Total Unique Constraints:** 12

---

## Notes

1. **UUIDs:** All primary keys use UUID (not auto-incrementing integers)
2. **Soft Deletes:** deleted_at field on core entities for audit trail
3. **Timestamps:** created_at and updated_at on all tables with automatic triggers
4. **Payment Ready:** Payment schema fully designed for Phase 2 activation
5. **RBAC:** Roles and Permissions tables enable fine-grained access control
6. **Audit Trail:** activity_logs tracks all administrative actions
7. **Analytics:** search_logs and daily_analytics support dashboard features
