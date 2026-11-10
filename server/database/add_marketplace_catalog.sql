-- Multi-service marketplace extension. Safe to run repeatedly.
CREATE TABLE IF NOT EXISTS category_filter_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
    filter_key VARCHAR(100) NOT NULL,
    label VARCHAR(150) NOT NULL,
    input_type VARCHAR(30) NOT NULL DEFAULT 'select'
        CHECK (input_type IN ('select', 'multiselect', 'text', 'number', 'boolean')),
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (category_id, filter_key)
);

ALTER TABLE services
    ADD COLUMN IF NOT EXISTS service_mode VARCHAR(30) DEFAULT 'at_customer'
        CHECK (service_mode IN ('at_customer', 'at_provider', 'pickup_drop', 'remote')),
    ADD COLUMN IF NOT EXISTS price_type VARCHAR(30) DEFAULT 'fixed'
        CHECK (price_type IN ('fixed', 'starting_from', 'hourly', 'quote')),
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS requirements JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_category_filters_category
    ON category_filter_definitions(category_id, display_order);

INSERT INTO service_categories (name, slug, description, icon, display_order)
VALUES
    ('Car Service & Repair', 'car-service-repair', 'Car servicing, diagnostics, repairs and roadside help.', 'car', 10),
    ('AC Service & Repair', 'ac-service-repair', 'Installation, servicing, gas refill and AC repair.', 'snowflake', 20),
    ('Appliance Repair', 'appliance-repair', 'Repair for refrigerators, washing machines, geysers and more.', 'appliance', 30),
    ('Plumbing', 'plumbing', 'Leak repair, installations, drainage and emergency plumbing.', 'faucet', 40),
    ('Electrical', 'electrical', 'Home and commercial electrical installation and repair.', 'bolt', 50),
    ('Home Cleaning', 'home-cleaning', 'Deep cleaning, regular cleaning and move-in cleaning.', 'broom', 60),
    ('Painting', 'painting', 'Interior, exterior and commercial painting services.', 'paint-roller', 70),
    ('Packers & Movers', 'packers-movers', 'Local, intercity and office relocation services.', 'truck', 80),
    ('Computer & Mobile Repair', 'computer-mobile-repair', 'Doorstep and workshop device repair.', 'laptop', 90),
    ('Pest Control', 'pest-control', 'Safe pest treatment for homes and businesses.', 'shield', 100)
ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description, icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order, is_active = true,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO category_filter_definitions
    (category_id, filter_key, label, options, is_required, display_order)
SELECT id, filter_key, label, options::jsonb, required, ordering
FROM service_categories
CROSS JOIN (VALUES
    ('car-service-repair', 'vehicle_make', 'Car make', '["Maruti Suzuki","Hyundai","Tata","Mahindra","Toyota","Honda","Kia","Other"]', true, 10),
    ('car-service-repair', 'vehicle_year', 'Manufacturing year', '["2026","2025","2024","2023","2022","2021","2020 or older"]', false, 20),
    ('ac-service-repair', 'ac_type', 'AC type', '["Split AC","Window AC","Cassette AC","Central AC"]', true, 10),
    ('ac-service-repair', 'capacity', 'Capacity', '["1 ton","1.2 ton","1.5 ton","2 ton","Not sure"]', false, 20),
    ('appliance-repair', 'appliance', 'Appliance', '["Refrigerator","Washing machine","Geyser","Microwave","Television","Other"]', true, 10),
    ('home-cleaning', 'home_size', 'Home size', '["1 BHK","2 BHK","3 BHK","4+ BHK","Villa"]', true, 10),
    ('packers-movers', 'move_type', 'Move type', '["Within city","Intercity","Office relocation"]', true, 10)
) AS seed(slug, filter_key, label, options, required, ordering)
WHERE service_categories.slug = seed.slug
ON CONFLICT (category_id, filter_key) DO UPDATE SET
    label = EXCLUDED.label, options = EXCLUDED.options,
    is_required = EXCLUDED.is_required, display_order = EXCLUDED.display_order;
