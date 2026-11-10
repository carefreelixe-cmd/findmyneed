import { query } from "../config/database.js";
import { searchServiceIds } from "../services/searchService.js";

const numberOr = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getHealth = async (req, res) => {
  try {
    const result = await query(
      "SELECT current_database() AS database, NOW() AS time",
    );
    res.json({ status: "ok", databaseStatus: "connected", ...result.rows[0] });
  } catch {
    res.status(503).json({ status: "error", databaseStatus: "disconnected" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const result = await query(`
      SELECT sc.id, sc.name, sc.slug, sc.description, sc.icon, sc.parent_id,
             COUNT(DISTINCT s.id)::int AS service_count,
             COALESCE(JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
               'key', cfd.filter_key, 'label', cfd.label, 'type', cfd.input_type,
               'options', cfd.options, 'required', cfd.is_required,
               'displayOrder', cfd.display_order
             )) FILTER (WHERE cfd.id IS NOT NULL), '[]'::jsonb) AS filters
      FROM service_categories sc
      LEFT JOIN services s ON s.category_id = sc.id AND s.is_active = true
      LEFT JOIN category_filter_definitions cfd ON cfd.category_id = sc.id
      WHERE sc.is_active = true AND sc.deleted_at IS NULL
      GROUP BY sc.id
      ORDER BY sc.display_order, sc.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Marketplace categories error:", error);
    res.status(500).json({ message: "Unable to load service categories" });
  }
};

export const getLocations = async (req, res) => {
  try {
    const result = await query(`
      SELECT p.city, p.state, COUNT(*)::int AS provider_count
      FROM providers p JOIN users u ON u.id = p.user_id
      WHERE p.deleted_at IS NULL AND u.is_active = true AND p.city IS NOT NULL
      GROUP BY p.city, p.state ORDER BY provider_count DESC, p.city
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Marketplace locations error:", error);
    res.status(500).json({ message: "Unable to load locations" });
  }
};

export const searchMarketplace = async (req, res) => {
  try {
    const page = Math.max(1, numberOr(req.query.page, 1));
    const limit = Math.min(50, Math.max(1, numberOr(req.query.limit, 12)));
    const values = [];
    const filters = [
      "p.deleted_at IS NULL",
      "u.is_active = true",
      "u.is_approved = true",
      "p.is_verified = true",
      "s.is_active = true",
      "s.deleted_at IS NULL",
    ];
    const add = (template, value) => {
      values.push(value);
      filters.push(template.replaceAll("?", `$${values.length}`));
    };

    if (req.query.q) {
      const indexedIds = await searchServiceIds(req.query.q);
      if (indexedIds) {
        add("s.id = ANY(?::uuid[])", indexedIds);
      } else {
        add(
          "(p.business_name ILIKE ? OR s.name ILIKE ? OR s.description ILIKE ?)",
          `%${req.query.q}%`,
        );
      }
    }
    if (req.query.category)
      add("(sc.id::text = ? OR sc.slug = ?)", req.query.category);
    if (req.query.city) add("p.city ILIKE ?", req.query.city);
    if (req.query.suburb)
      add(
        "(p.suburb ILIKE ? OR EXISTS (SELECT 1 FROM provider_service_areas psa WHERE psa.provider_id = p.id AND psa.suburb ILIKE ?))",
        req.query.suburb,
      );
    if (req.query.minRating)
      add("p.rating >= ?", numberOr(req.query.minRating, 0));
    if (req.query.maxPrice)
      add("s.price <= ?", numberOr(req.query.maxPrice, 999999));
    if (req.query.serviceMode) add("s.service_mode = ?", req.query.serviceMode);

    const fromAndWhere = `
      FROM services s
      JOIN providers p ON p.id = s.provider_id
      JOIN users u ON u.id = p.user_id
      LEFT JOIN service_categories sc ON sc.id = s.category_id
      WHERE ${filters.join(" AND ")}`;
    const sort =
      {
        price: "s.price ASC NULLS LAST",
        rating: "p.rating DESC, p.total_reviews DESC",
        newest: "s.created_at DESC",
      }[req.query.sort] ||
      "s.is_featured DESC, p.rating DESC, p.total_reviews DESC";

    const count = await query(
      `SELECT COUNT(*)::int AS total ${fromAndWhere}`,
      values,
    );
    const result = await query(
      `
      SELECT s.id AS service_id, s.name AS service_name, s.description, s.price,
             s.price_type, s.duration, s.service_mode, s.images,
             sc.id AS category_id, sc.name AS category_name, sc.slug AS category_slug,
             p.id AS provider_id, p.business_name, p.business_logo, p.suburb,
             p.city, p.state, p.rating, p.total_reviews, p.total_bookings, p.is_verified
      ${fromAndWhere} ORDER BY ${sort}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `,
      [...values, limit, (page - 1) * limit],
    );

    const total = count.rows[0].total;
    res.json({
      results: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Marketplace search error:", error);
    res.status(500).json({ message: "Unable to search the marketplace" });
  }
};

export const getHome = async (req, res) => {
  try {
    const [categories, providers, reviews, stats] = await Promise.all([
      query(
        `SELECT id, name, slug, description, icon FROM service_categories WHERE is_active = true AND deleted_at IS NULL ORDER BY display_order, name LIMIT 12`,
      ),
      query(
        `SELECT p.id, p.business_name, p.business_logo, p.city, p.suburb, p.rating, p.total_reviews FROM providers p JOIN users u ON u.id = p.user_id WHERE p.is_verified = true AND p.deleted_at IS NULL AND u.is_active = true AND u.is_approved = true ORDER BY p.rating DESC, p.total_reviews DESC LIMIT 8`,
      ),
      query(
        `SELECT r.rating, r.comment, u.first_name, u.last_name, p.business_name FROM reviews r JOIN users u ON u.id = r.customer_id JOIN providers p ON p.id = r.provider_id WHERE r.is_approved = true AND r.is_hidden = false AND r.deleted_at IS NULL ORDER BY r.created_at DESC LIMIT 6`,
      ),
      query(
        `SELECT (SELECT COUNT(*)::int FROM providers WHERE deleted_at IS NULL) AS providers, (SELECT COUNT(*)::int FROM service_categories WHERE is_active = true AND deleted_at IS NULL) AS categories, (SELECT COUNT(*)::int FROM bookings WHERE deleted_at IS NULL) AS bookings`,
      ),
    ]);
    res.json({
      categories: categories.rows,
      featuredProviders: providers.rows,
      reviews: reviews.rows,
      stats: stats.rows[0],
    });
  } catch (error) {
    console.error("Marketplace home error:", error);
    res.status(500).json({ message: "Unable to load marketplace content" });
  }
};
