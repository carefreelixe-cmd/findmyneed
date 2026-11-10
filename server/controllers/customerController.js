import { query, withTransaction } from "../config/database.js";

// Search Providers
export const searchProviders = async (req, res) => {
  try {
    const {
      search,
      suburb,
      categoryId,
      minRating,
      page = 1,
      limit = 12,
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClause =
      "WHERE p.is_verified = true AND u.is_active = true AND u.is_approved = true";
    const params = [];
    let paramCount = 1;

    if (search) {
      whereClause += ` AND (p.business_name ILIKE $${paramCount} OR p.business_description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (suburb) {
      whereClause += ` AND p.suburb ILIKE $${paramCount}`;
      params.push(`%${suburb}%`);
      paramCount++;
    }

    if (categoryId) {
      whereClause += ` AND EXISTS (SELECT 1 FROM services WHERE provider_id = p.id AND category_id = $${paramCount})`;
      params.push(categoryId);
      paramCount++;
    }

    if (minRating) {
      whereClause += ` AND p.rating >= $${paramCount}`;
      params.push(minRating);
      paramCount++;
    }

    params.push(limit, offset);

    const result = await query(
      `
      SELECT p.id, p.business_name, p.business_description, p.business_logo,
             p.suburb, p.city, p.state, p.rating, p.total_reviews, p.total_bookings
      FROM providers p
      JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.rating DESC, p.total_reviews DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `,
      params,
    );

    const countResult = await query(
      `
      SELECT COUNT(*) FROM providers p
      JOIN users u ON p.user_id = u.id
      ${whereClause}
    `,
      params.slice(0, -2),
    );

    res.json({
      providers: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (error) {
    console.error("Search providers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Provider by ID
export const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;

    const providerResult = await query(
      `SELECT p.*, u.email, u.phone
       FROM providers p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id],
    );

    if (providerResult.rows.length === 0) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const servicesResult = await query(
      `SELECT s.*, sc.name as category_name
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.provider_id = $1 AND s.is_active = true
       ORDER BY s.created_at DESC`,
      [id],
    );

    const reviewsResult = await query(
      `SELECT r.*, u.first_name, u.last_name
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       WHERE r.provider_id = $1 AND r.is_approved = true AND r.is_hidden = false
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id],
    );

    res.json({
      provider: providerResult.rows[0],
      services: servicesResult.rows,
      reviews: reviewsResult.rows,
    });
  } catch (error) {
    console.error("Get provider by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create Booking
export const createBooking = async (req, res) => {
  try {
    const {
      providerId,
      serviceId,
      bookingDate,
      bookingTime,
      customerName,
      customerEmail,
      customerPhone,
      address,
      suburb,
      notes,
      totalPrice,
      requirements = {},
    } = req.body;

    // Validate required fields
    if (
      !providerId ||
      !serviceId ||
      !bookingDate ||
      !customerName ||
      !customerEmail
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const booking = await withTransaction(async (client) => {
      const serviceResult = await client.query(
        `SELECT s.id, s.provider_id, s.price
         FROM services s
         JOIN providers p ON p.id = s.provider_id
         JOIN users u ON u.id = p.user_id
         WHERE s.id = $1 AND s.provider_id = $2 AND s.is_active = true
           AND s.deleted_at IS NULL AND p.deleted_at IS NULL
           AND u.is_active = true AND u.is_approved = true
         FOR SHARE`,
        [serviceId, providerId],
      );

      if (serviceResult.rowCount === 0) {
        const error = new Error("The selected service is unavailable");
        error.statusCode = 409;
        throw error;
      }

      const providerResult = await client.query(
        "SELECT user_id FROM providers WHERE id = $1 FOR SHARE",
        [providerId],
      );
      const safePrice = serviceResult.rows[0].price ?? totalPrice ?? 0;
      const bookingResult = await client.query(
        `INSERT INTO bookings (
          customer_id, provider_id, service_id, booking_date, booking_time,
          customer_name, customer_email, customer_phone, address, suburb,
          notes, total_price, status, requirements
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          req.user.id,
          providerId,
          serviceId,
          bookingDate,
          bookingTime,
          customerName,
          customerEmail,
          customerPhone,
          address,
          suburb,
          notes,
          safePrice,
          "pending",
          requirements,
        ],
      );

      const notificationResult = await client.query(
        `INSERT INTO notifications (user_id, type, subject, message)
         VALUES ($1, 'in_app', 'New Booking Request', $2)
         RETURNING id`,
        [
          providerResult.rows[0].user_id,
          `New booking request from ${customerName}`,
        ],
      );

      await client.query(
        `INSERT INTO outbox_events (topic, aggregate_type, aggregate_id, payload)
         VALUES ('notification.send', 'booking', $1, $2)`,
        [
          bookingResult.rows[0].id,
          {
            notificationId: notificationResult.rows[0].id,
            bookingId: bookingResult.rows[0].id,
            templateKey: "booking_requested",
            data: {
              customerName,
              bookingDate,
              dashboardUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/provider`,
            },
          },
        ],
      );

      return bookingResult.rows[0];
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get Customer Bookings
export const getCustomerBookings = async (req, res) => {
  try {
    const result = await query(
      `SELECT b.*, s.name as service_name, p.business_name as provider_name,
              u.phone as provider_phone, u.email as provider_email,
              r.id as review_id, r.rating as review_rating, r.comment as review_comment
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN providers p ON b.provider_id = p.id
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN reviews r ON b.id = r.booking_id AND r.deleted_at IS NULL
       WHERE b.customer_id = $1
       ORDER BY b.booking_date DESC, b.created_at DESC`,
      [req.user.id],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get customer bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel Booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await query(
      `UPDATE bookings SET 
        status = 'cancelled',
        cancelled_by = $1,
        cancellation_reason = $2
       WHERE id = $3 AND customer_id = $1 AND status IN ('pending', 'approved')
       RETURNING *`,
      [req.user.id, reason, id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Booking not found or cannot be cancelled" });
    }

    res.json({
      message: "Booking cancelled successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create Review
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Check if booking exists and is completed
    const bookingResult = await query(
      `SELECT b.*, p.id as provider_id
       FROM bookings b
       JOIN providers p ON b.provider_id = p.id
       WHERE b.id = $1 AND b.customer_id = $2 AND b.status = 'completed'`,
      [bookingId, req.user.id],
    );

    if (bookingResult.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Booking not found or not completed" });
    }

    const booking = bookingResult.rows[0];

    // Check if review already exists
    const existingReview = await query(
      "SELECT id FROM reviews WHERE booking_id = $1",
      [bookingId],
    );

    if (existingReview.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Review already exists for this booking" });
    }

    // Create review
    const result = await query(
      `INSERT INTO reviews (booking_id, provider_id, customer_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [bookingId, booking.provider_id, req.user.id, rating, comment],
    );

    // Update provider rating
    await query(
      `
      UPDATE providers SET
        rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE provider_id = $1 AND is_approved = true),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE provider_id = $1 AND is_approved = true)
      WHERE id = $1
    `,
      [booking.provider_id],
    );

    res.status(201).json({
      message: "Review submitted successfully",
      review: result.rows[0],
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Categories
export const getCategories = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM service_categories 
       WHERE is_active = true 
       ORDER BY display_order ASC, name ASC`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Services by Category
export const getServicesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const result = await query(
      `SELECT s.*, p.business_name, p.rating, p.suburb
       FROM services s
       JOIN providers p ON s.provider_id = p.id
       WHERE s.category_id = $1 AND s.is_active = true
       ORDER BY p.rating DESC`,
      [categoryId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get services by category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
