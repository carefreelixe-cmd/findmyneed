import { query } from "../config/database.js";
import { enqueue } from "../queues/queues.js";

// Get Provider Profile
export const getProviderProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, u.email, u.phone
       FROM providers p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get provider profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Provider Profile
export const updateProviderProfile = async (req, res) => {
  try {
    const {
      businessName,
      businessDescription,
      address,
      suburb,
      city,
      state,
      postalCode,
      country,
      specialties,
    } = req.body;

    console.log("Update request - User ID:", req.user?.id);
    console.log("Form data received:", {
      businessName,
      businessDescription,
      address,
      suburb,
      city,
      state,
      postalCode,
      country,
      specialties,
    });

    // Convert specialties string to array if it's a string
    let specialtiesArray = null;
    if (specialties) {
      if (typeof specialties === "string") {
        // Split by comma and trim whitespace, filter empty strings
        specialtiesArray = specialties
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      } else if (Array.isArray(specialties)) {
        specialtiesArray = specialties;
      }
    }

    const result = await query(
      `UPDATE providers SET
        business_name = COALESCE($1, business_name),
        business_description = COALESCE($2, business_description),
        address = COALESCE($3, address),
        suburb = COALESCE($4, suburb),
        city = COALESCE($5, city),
        state = COALESCE($6, state),
        postal_code = COALESCE($7, postal_code),
        country = COALESCE($8, country),
        specialties = CASE WHEN $9::text[] IS NOT NULL THEN $9::text[] ELSE specialties END,
        updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $10
       RETURNING *`,
      [
        businessName,
        businessDescription,
        address,
        suburb,
        city,
        state,
        postalCode,
        country,
        specialtiesArray,
        req.user.id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    res.json({
      message: "Profile updated successfully",
      provider: result.rows[0],
    });
  } catch (error) {
    console.error("Update provider profile error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get Provider Services
export const getProviderServices = async (req, res) => {
  try {
    const result = await query(
      `SELECT s.*, sc.name as category_name
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.provider_id = (SELECT id FROM providers WHERE user_id = $1)
       ORDER BY s.created_at DESC`,
      [req.user.id],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get provider services error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create Service
export const createService = async (req, res) => {
  try {
    const {
      categoryId,
      name,
      description,
      price,
      duration,
      serviceAreas,
      images,
    } = req.body;

    // Validate required fields
    if (!name || !categoryId || !price) {
      return res.status(400).json({
        message: "Missing required fields",
        error: "name, categoryId, and price are required",
      });
    }

    // Get provider ID
    const providerResult = await query(
      "SELECT id FROM providers WHERE user_id = $1",
      [req.user.id],
    );

    if (providerResult.rows.length === 0) {
      console.error("Provider not found for user_id:", req.user.id);
      return res.status(404).json({
        message: "Provider profile not found",
        error: "You must create a provider profile first",
      });
    }

    const providerId = providerResult.rows[0].id;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Ensure numeric fields
    const numPrice = parseFloat(price) || 0;
    const numDuration = duration ? parseFloat(duration) : null;

    // Convert serviceAreas from comma-separated string to JSON array
    let areasArray = [];
    if (serviceAreas) {
      if (typeof serviceAreas === "string") {
        areasArray = serviceAreas
          .split(",")
          .map((area) => area.trim())
          .filter((area) => area);
      } else if (Array.isArray(serviceAreas)) {
        areasArray = serviceAreas;
      }
    }

    const result = await query(
      `INSERT INTO services (provider_id, category_id, name, slug, description, price, duration, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        providerId,
        categoryId,
        name,
        slug,
        description || "",
        numPrice,
        numDuration,
        images || null,
      ],
    );

    // Handle service areas separately if provided
    if (areasArray.length > 0) {
      for (const area of areasArray) {
        try {
          await query(
            `INSERT INTO provider_service_areas (provider_id, suburb)
             VALUES ($1, $2)`,
            [providerId, area],
          );
        } catch (areaError) {
          // Ignore duplicate area errors
          if (!areaError.message.includes("duplicate")) {
            console.error("Error adding service area:", areaError.message);
          }
        }
      }
    }

    await enqueue("search.index-service", {
      service: {
        id: result.rows[0].id,
        serviceName: result.rows[0].name,
        description: result.rows[0].description,
        price: result.rows[0].price,
        providerId,
      },
    });

    console.log("Service created:", result.rows[0]);
    res.status(201).json({
      message: "Service created successfully",
      service: result.rows[0],
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      name,
      description,
      price,
      duration,
      serviceAreas,
      images,
      isActive,
    } = req.body;

    // Verify ownership
    const providerResult = await query(
      "SELECT id FROM providers WHERE user_id = $1",
      [req.user.id],
    );

    if (providerResult.rows.length === 0) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const providerId = providerResult.rows[0].id;

    // Update service
    const result = await query(
      `UPDATE services SET
        category_id = COALESCE($1, category_id),
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        duration = COALESCE($5, duration),
        images = COALESCE($6, images),
        is_active = COALESCE($7, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND provider_id = $9
       RETURNING *`,
      [
        categoryId,
        name,
        description,
        price,
        duration,
        images,
        isActive,
        id,
        providerId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Handle service areas separately if provided
    if (serviceAreas) {
      // Clear existing service areas for this provider
      await query("DELETE FROM provider_service_areas WHERE provider_id = $1", [
        providerId,
      ]);

      // Add new service areas
      let areasArray = [];
      if (typeof serviceAreas === "string") {
        areasArray = serviceAreas
          .split(",")
          .map((area) => area.trim())
          .filter((area) => area);
      } else if (Array.isArray(serviceAreas)) {
        areasArray = serviceAreas;
      }

      for (const area of areasArray) {
        await query(
          `INSERT INTO provider_service_areas (provider_id, suburb)
           VALUES ($1, $2)`,
          [providerId, area],
        );
      }
    }

    await enqueue("search.index-service", {
      service: {
        id: result.rows[0].id,
        serviceName: result.rows[0].name,
        description: result.rows[0].description,
        price: result.rows[0].price,
        providerId,
      },
    });

    res.json({
      message: "Service updated successfully",
      service: result.rows[0],
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const providerResult = await query(
      "SELECT id FROM providers WHERE user_id = $1",
      [req.user.id],
    );

    const result = await query(
      "DELETE FROM services WHERE id = $1 AND provider_id = $2 RETURNING id",
      [id, providerResult.rows[0].id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    await enqueue("search.remove-service", { serviceId: id });
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Provider Bookings
export const getProviderBookings = async (req, res) => {
  try {
    const { status } = req.query;

    let whereClause =
      "WHERE b.provider_id = (SELECT id FROM providers WHERE user_id = $1)";
    const params = [req.user.id];

    if (status) {
      whereClause += " AND b.status = $2";
      params.push(status);
    }

    const result = await query(
      `SELECT b.*, s.name as service_name
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       ${whereClause}
       ORDER BY b.booking_date DESC, b.created_at DESC`,
      params,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get provider bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Booking Status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "rejected",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Valid statuses are: " + validStatuses.join(", "),
      });
    }

    // Get booking first to get customer_id
    const bookingResult = await query(
      `SELECT customer_id FROM bookings WHERE id = $1 AND provider_id = (SELECT id FROM providers WHERE user_id = $2)`,
      [id, req.user.id],
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const customerId = bookingResult.rows[0].customer_id;

    // Update booking status
    const result = await query(
      `UPDATE bookings SET status = $1, completed_at = CASE WHEN $1::varchar = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id],
    );

    // Create notification for customer
    try {
      await query(
        `INSERT INTO notifications (user_id, type, subject, message)
         VALUES ($1, $2, $3, $4)`,
        [
          customerId,
          "booking_status",
          "Booking Status Updated",
          `Your booking status has been updated to: ${status}`,
        ],
      );
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Don't fail the whole operation if notification fails
    }

    res.json({
      message: "Booking status updated successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Get Provider Reviews
export const getProviderReviews = async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, u.first_name, u.last_name, b.id as booking_id
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       LEFT JOIN bookings b ON r.booking_id = b.id
       WHERE r.provider_id = (SELECT id FROM providers WHERE user_id = $1)
       ORDER BY r.created_at DESC`,
      [req.user.id],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get provider reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Respond to Review
export const respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const result = await query(
      `UPDATE reviews SET 
        provider_response = $1,
        provider_responded_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND provider_id = (SELECT id FROM providers WHERE user_id = $3)
       RETURNING *`,
      [response, id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({
      message: "Response added successfully",
      review: result.rows[0],
    });
  } catch (error) {
    console.error("Respond to review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
