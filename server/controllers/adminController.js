import { query, withTransaction } from "../config/database.js";
import bcrypt from "bcryptjs";

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'provider') as total_providers,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
        (SELECT COUNT(*) FROM services WHERE is_active = true) as active_services,
        (SELECT COUNT(*) FROM reviews) as total_reviews,
        (SELECT COUNT(*) FROM users WHERE role = 'provider' AND is_approved = false) as pending_approvals
    `);

    const recentBookings = await query(`
      SELECT b.id, b.status, b.booking_date, b.created_at, b.customer_name,
             s.name as service_name, p.business_name as provider_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN providers p ON b.provider_id = p.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `);

    const topProviders = await query(`
      SELECT p.id, p.business_name, p.rating, p.total_reviews, p.total_bookings,
             u.email, u.phone
      FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_verified = true
      ORDER BY p.rating DESC, p.total_reviews DESC
      LIMIT 10
    `);

    res.json({
      stats: stats.rows[0],
      recentBookings: recentBookings.rows,
      topProviders: topProviders.rows,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Providers
export const getAllProviders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (status === "pending") {
      whereClause += " AND u.is_approved = false";
    } else if (status === "approved") {
      whereClause += " AND u.is_approved = true";
    }

    if (search) {
      whereClause += ` AND (p.business_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    params.push(limit, offset);

    const result = await query(
      `
      SELECT p.*, u.email, u.phone, u.is_active, u.is_approved, u.created_at as user_created_at
      FROM providers p
      JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
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
    console.error("Get providers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve/Reject Provider
export const updateProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    await withTransaction(async (client) => {
      const result = await client.query(
        `UPDATE users SET is_approved = $1
         WHERE id = (SELECT user_id FROM providers WHERE id = $2)
         RETURNING id, first_name`,
        [isApproved, id],
      );

      if (result.rowCount === 0) {
        const error = new Error("Provider not found");
        error.statusCode = 404;
        throw error;
      }

      await client.query(
        `UPDATE providers SET is_verified = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [isApproved, id],
      );
      await client.query(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values)
         VALUES ($1, $2, 'provider', $3, $4)`,
        [
          req.user.id,
          isApproved ? "approve_provider" : "reject_provider",
          id,
          JSON.stringify({ isApproved }),
        ],
      );
      const notification = await client.query(
        `INSERT INTO notifications (user_id, type, subject, message)
         VALUES ($1, 'email', $2, $3) RETURNING id`,
        [
          result.rows[0].id,
          isApproved
            ? "Professional profile approved"
            : "Professional application update",
          isApproved
            ? "Your profile is approved and can now receive bookings."
            : "Your professional application was not approved. Contact support for details.",
        ],
      );
      await client.query(
        `INSERT INTO outbox_events (topic, aggregate_type, aggregate_id, payload)
         VALUES ('notification.send', 'provider', $1, $2)`,
        [
          id,
          {
            notificationId: notification.rows[0].id,
            templateKey: isApproved ? "provider_approved" : "general",
            data: {
              firstName: result.rows[0].first_name,
              title: isApproved
                ? "Your profile is approved"
                : "Application update",
              message: isApproved
                ? "Your professional profile is live and ready for service listings."
                : "Your application needs attention. Contact support for more information.",
              dashboardUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/provider`,
            },
          },
        ],
      );
    });

    res.json({
      message: `Provider ${isApproved ? "approved" : "rejected"} successfully`,
    });
  } catch (error) {
    console.error("Update provider status error:", error);
    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Server error",
    });
  }
};

// Get All Customers
export const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE role = 'customer'";
    const params = [];
    let paramCount = 1;

    if (search) {
      whereClause += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    params.push(limit, offset);

    const result = await query(
      `
      SELECT id, email, first_name, last_name, phone, is_active, created_at, last_login_at,
             (SELECT COUNT(*) FROM bookings WHERE customer_id = users.id) as total_bookings
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `,
      params,
    );

    const countResult = await query(
      `
      SELECT COUNT(*) FROM users ${whereClause}
    `,
      params.slice(0, -2),
    );

    res.json({
      customers: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Bookings
export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (status) {
      whereClause += ` AND b.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      whereClause += ` AND (b.customer_name ILIKE $${paramCount} OR p.business_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    params.push(limit, offset);

    const result = await query(
      `
      SELECT b.*, s.name as service_name, p.business_name as provider_name, p.id as provider_id
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN providers p ON b.provider_id = p.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `,
      params,
    );

    const countResult = await query(
      `
      SELECT COUNT(*) FROM bookings b ${whereClause}
    `,
      params.slice(0, -2),
    );

    res.json({
      bookings: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle User Active Status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await query("UPDATE users SET is_active = $1 WHERE id = $2", [
      isActive,
      id,
    ]);

    res.json({ message: "User status updated successfully" });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Analytics
export const getAnalytics = async (req, res) => {
  try {
    const totalBookings = await query("SELECT COUNT(*) FROM bookings");
    const completedBookings = await query(
      "SELECT COUNT(*) FROM bookings WHERE status = 'completed'",
    );
    const totalRevenue = await query(
      "SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE status = 'completed'",
    );

    const bookingsBySuburb = await query(`
      SELECT suburb, COUNT(*) as count
      FROM providers
      GROUP BY suburb
      ORDER BY count DESC
      LIMIT 10
    `);

    const topServices = await query(`
      SELECT s.name as service_name, COUNT(*) as bookings
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      GROUP BY s.id, s.name
      ORDER BY bookings DESC
      LIMIT 5
    `);

    const mostViewedProviders = await query(`
      SELECT p.id, p.business_name, p.rating, p.total_reviews, p.total_bookings
      FROM providers p
      ORDER BY p.total_bookings DESC
      LIMIT 5
    `);

    res.json({
      totalBookings: parseInt(totalBookings.rows[0].count),
      completedBookings: parseInt(completedBookings.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].total),
      totalCommission: parseFloat(totalRevenue.rows[0].total) * 0.1, // 10% commission
      bookingsBySuburb: bookingsBySuburb.rows,
      topServices: topServices.rows,
      mostViewedProviders: mostViewedProviders.rows,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Categories
export const getCategories = async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM service_categories WHERE is_active = true ORDER BY name ASC",
    );
    res.json({ categories: result.rows });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add Category
export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const result = await query(
      `INSERT INTO service_categories (name, description, slug) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, description, name.toLowerCase().replace(/\s+/g, "-")],
    );

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        "add_category",
        "category",
        result.rows[0].id,
        JSON.stringify({ name, description }),
      ],
    );

    res
      .status(201)
      .json({
        message: "Category added successfully",
        category: result.rows[0],
      });
  } catch (error) {
    console.error("Add category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      "DELETE FROM service_categories WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        "delete_category",
        "category",
        id,
        JSON.stringify({ name: result.rows[0].name }),
      ],
    );

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Reviews
export const getReviews = async (req, res) => {
  try {
    const result = await query(`
      SELECT r.*, 
             u.first_name || ' ' || u.last_name as customer_name, 
             p.business_name as provider_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      JOIN providers p ON r.provider_id = p.id
      WHERE r.deleted_at IS NULL
      ORDER BY r.created_at DESC
      LIMIT 100
    `);

    res.json({ reviews: result.rows });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve/Reject Review (Moderation)
export const moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, isHidden } = req.body;

    const result = await query(
      `UPDATE reviews SET 
        is_approved = COALESCE($1, is_approved),
        is_hidden = COALESCE($2, is_hidden),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [isApproved, isHidden, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        "moderate_review",
        "review",
        id,
        JSON.stringify({ is_approved: isApproved, is_hidden: isHidden }),
      ],
    );

    res.json({
      message: "Review moderated successfully",
      review: result.rows[0],
    });
  } catch (error) {
    console.error("Moderate review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete
    const result = await query(
      "UPDATE reviews SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        "delete_review",
        "review",
        id,
        JSON.stringify({ reason: "Review removed" }),
      ],
    );

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Activity Logs
export const getActivityLogs = async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM activity_logs
      ORDER BY created_at DESC
      LIMIT 100
    `);

    res.json({ logs: result.rows });
  } catch (error) {
    console.error("Get activity logs error:", error);
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
      "approved",
      "in_progress",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await query(
      `UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        "update_booking_status",
        "booking",
        id,
        JSON.stringify({ status }),
      ],
    );

    res.json({
      message: "Booking status updated successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Deactivate Provider
export const deactivateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const result = await query(
      `UPDATE users SET is_active = $1 WHERE id = (SELECT user_id FROM providers WHERE id = $2) RETURNING id`,
      [isActive, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        isActive ? "activate_provider" : "deactivate_provider",
        "provider",
        id,
        JSON.stringify({ isActive }),
      ],
    );

    res.json({
      message: `Provider ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Deactivate provider error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================================================================
// BULK CSV IMPORT - Import up to 500 businesses
// ====================================================================
export const bulkImportBusinesses = async (req, res) => {
  try {
    const { businesses } = req.body; // Array of business objects from CSV

    if (!Array.isArray(businesses) || businesses.length === 0) {
      return res.status(400).json({ message: "No businesses to import" });
    }

    if (businesses.length > 500) {
      return res
        .status(400)
        .json({ message: "Maximum 500 businesses allowed per import" });
    }

    const results = {
      successful: [],
      failed: [],
      totalProcessed: businesses.length,
    };

    for (let i = 0; i < businesses.length; i++) {
      try {
        const {
          businessName,
          email,
          phone,
          description,
          services = [],
          serviceAreas = [],
        } = businesses[i];

        // Validate required fields
        if (!businessName || !email || !phone) {
          results.failed.push({
            index: i + 1,
            businessName: businessName || "N/A",
            error: "Missing required fields: businessName, email, phone",
          });
          continue;
        }

        // Check if email already exists
        const existingUser = await query(
          "SELECT id FROM users WHERE email = $1",
          [email],
        );
        if (existingUser.rows.length > 0) {
          results.failed.push({
            index: i + 1,
            businessName,
            error: "Email already exists",
          });
          continue;
        }

        // Create user account
        const passwordHash = bcrypt.hashSync("password123", 10); // Temporary password
        const userResult = await query(
          `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_approved)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            email,
            passwordHash,
            "provider",
            businessName.split(" ")[0],
            businessName.split(" ").slice(1).join(" ") || "Provider",
            phone,
            true,
          ],
        );

        const userId = userResult.rows[0].id;

        // Create provider profile
        const providerResult = await query(
          `INSERT INTO providers (user_id, business_name, business_description, is_verified)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [userId, businessName, description || "", true],
        );

        const providerId = providerResult.rows[0].id;

        // Assign services if provided (services are stored in service_categories)
        if (Array.isArray(services) && services.length > 0) {
          for (const serviceName of services) {
            const serviceResult = await query(
              "SELECT id FROM service_categories WHERE name ILIKE $1 LIMIT 1",
              [`%${serviceName}%`],
            );
            if (serviceResult.rows.length > 0) {
              try {
                await query(
                  `INSERT INTO provider_services (provider_id, category_id) VALUES ($1, $2)`,
                  [providerId, serviceResult.rows[0].id],
                );
              } catch (serviceError) {
                // Ignore duplicate service errors
                if (!serviceError.message.includes("duplicate")) {
                  console.error("Error adding service:", serviceError.message);
                }
              }
            }
          }
        }

        // Assign service areas/suburbs if provided
        if (Array.isArray(serviceAreas) && serviceAreas.length > 0) {
          for (const suburb of serviceAreas) {
            try {
              await query(
                `INSERT INTO provider_service_areas (provider_id, suburb) VALUES ($1, $2)`,
                [providerId, suburb],
              );
            } catch (areaError) {
              // Ignore duplicate area errors
              if (!areaError.message.includes("duplicate")) {
                console.error("Error adding service area:", areaError.message);
              }
            }
          }
        }

        results.successful.push({
          index: i + 1,
          businessName,
          email,
          providerId,
        });

        // Log activity
        await query(
          `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values, new_values)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            req.user.id,
            "bulk_import_business",
            "provider",
            providerId,
            null,
            JSON.stringify({ businessName, email }),
          ],
        );
      } catch (itemError) {
        results.failed.push({
          index: i + 1,
          businessName: businesses[i].businessName || "N/A",
          error: itemError.message,
        });
      }
    }

    res.json({
      message: `Import completed: ${results.successful.length} successful, ${results.failed.length} failed`,
      results,
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({ message: "Server error during bulk import" });
  }
};

// ====================================================================
// CREATE BUSINESS MANUALLY
// ====================================================================
export const createBusiness = async (req, res) => {
  try {
    const {
      businessName,
      email,
      phone,
      description,
      services = [],
      serviceAreas = [],
    } = req.body;

    // Validate required fields
    if (!businessName || !email || !phone) {
      return res
        .status(400)
        .json({
          message: "Missing required fields: businessName, email, phone",
        });
    }

    // Check if email already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create user account
    const passwordHash = bcrypt.hashSync("password123", 10);
    const userResult = await query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        email,
        passwordHash,
        "provider",
        businessName.split(" ")[0],
        businessName.split(" ").slice(1).join(" ") || "Provider",
        phone,
        true,
      ],
    );

    const userId = userResult.rows[0].id;

    // Create provider profile
    const providerResult = await query(
      `INSERT INTO providers (user_id, business_name, business_description, is_verified)
       VALUES ($1, $2, $3, $4)
       RETURNING id, business_name, business_description`,
      [userId, businessName, description || "", true],
    );

    const provider = providerResult.rows[0];

    // Assign services if provided (services are stored in service_categories)
    for (const serviceId of services) {
      try {
        await query(
          `INSERT INTO provider_services (provider_id, category_id) VALUES ($1, $2)`,
          [provider.id, serviceId],
        );
      } catch (serviceError) {
        // Ignore duplicate service errors
        if (!serviceError.message.includes("duplicate")) {
          console.error("Error adding service:", serviceError.message);
        }
      }
    }

    // Assign service areas if provided
    for (const suburb of serviceAreas) {
      try {
        await query(
          `INSERT INTO provider_service_areas (provider_id, suburb) VALUES ($1, $2)`,
          [provider.id, suburb],
        );
      } catch (areaError) {
        // Ignore duplicate area errors
        if (!areaError.message.includes("duplicate")) {
          console.error("Error adding service area:", areaError.message);
        }
      }
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        "create_business",
        "provider",
        provider.id,
        JSON.stringify({ businessName, email }),
      ],
    );

    res.status(201).json({
      message: "Business created successfully",
      provider: {
        id: provider.id,
        businessName: provider.business_name,
        description: provider.business_description,
        email,
        phone,
      },
    });
  } catch (error) {
    console.error("Create business error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================================================================
// EDIT BUSINESS
// ====================================================================
export const editBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      businessName,
      description,
      services = [],
      serviceAreas = [],
    } = req.body;

    // Update provider profile
    const result = await query(
      `UPDATE providers SET business_name = $1, business_description = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, business_name, business_description`,
      [businessName, description, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }

    const provider = result.rows[0];

    // Update services (remove old, add new) - use category_id
    await query("DELETE FROM provider_services WHERE provider_id = $1", [id]);
    for (const serviceId of services) {
      await query(
        `INSERT INTO provider_services (provider_id, category_id) VALUES ($1, $2)`,
        [id, serviceId],
      );
    }

    // Update service areas (remove old, add new)
    await query("DELETE FROM provider_service_areas WHERE provider_id = $1", [
      id,
    ]);
    for (const suburb of serviceAreas) {
      await query(
        `INSERT INTO provider_service_areas (provider_id, suburb) VALUES ($1, $2)`,
        [id, suburb],
      );
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        "update_business",
        "provider",
        id,
        JSON.stringify({ businessName, description }),
      ],
    );

    res.json({
      message: "Business updated successfully",
      provider: {
        id: provider.id,
        businessName: provider.business_name,
        description: provider.business_description,
      },
    });
  } catch (error) {
    console.error("Edit business error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================================================================
// GET BUSINESS WITH SERVICES AND SERVICE AREAS
// ====================================================================
export const getBusinessDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const businessResult = await query(
      `SELECT p.id, p.business_name, p.business_description, u.email, u.phone
       FROM providers p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id],
    );

    if (businessResult.rows.length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }

    const business = businessResult.rows[0];

    // Get assigned services (from provider_services linked to service_categories)
    const servicesResult = await query(
      `SELECT sc.id, sc.name FROM service_categories sc
       JOIN provider_services ps ON sc.id = ps.category_id
       WHERE ps.provider_id = $1`,
      [id],
    );

    // Get service areas (suburbs)
    const areasResult = await query(
      `SELECT id, suburb FROM provider_service_areas WHERE provider_id = $1`,
      [id],
    );

    res.json({
      business: {
        id: business.id,
        name: business.business_name,
        business_name: business.business_name,
        email: business.email,
        phone: business.phone,
        description: business.business_description,
        services: servicesResult.rows,
        serviceAreas: areasResult.rows,
      },
    });
  } catch (error) {
    console.error("Get business details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================================================================
// GET ALL SERVICES (for dropdown)
// ====================================================================
export const getAllServices = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name FROM service_categories WHERE is_active = true ORDER BY name`,
    );

    res.json({ services: result.rows });
  } catch (error) {
    console.error("Get all services error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// ====================================================================
// DELETE BUSINESS
// ====================================================================
export const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete the provider
    const result = await query(
      "UPDATE providers SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Also soft delete the user account
    await query(
      "UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1",
      [result.rows[0].user_id],
    );

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, "delete_business", "provider", id],
    );

    res.json({ message: "Business deleted successfully" });
  } catch (error) {
    console.error("Delete business error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================================================================
// PROVIDER DOCUMENT VERIFICATION
// ====================================================================

// Get all provider documents pending verification
export const getPendingDocuments = async (req, res) => {
  try {
    const result = await query(`
      SELECT pd.*, p.business_name, u.email as provider_email
      FROM provider_documents pd
      JOIN providers p ON pd.provider_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE pd.is_verified = false
      ORDER BY pd.created_at DESC
    `);

    res.json({ documents: result.rows });
  } catch (error) {
    console.error("Get pending documents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get documents for specific provider
export const getProviderDocuments = async (req, res) => {
  try {
    const { providerId } = req.params;

    const result = await query(
      `SELECT * FROM provider_documents WHERE provider_id = $1 ORDER BY created_at DESC`,
      [providerId],
    );

    res.json({ documents: result.rows });
  } catch (error) {
    console.error("Get provider documents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify provider document
export const verifyProviderDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { isVerified, rejectionReason } = req.body;

    const result = await query(
      `UPDATE provider_documents SET
        is_verified = $1,
        verified_by = $2,
        verified_at = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE NULL END,
        rejection_reason = $3
       WHERE id = $4
       RETURNING *`,
      [isVerified, req.user.id, rejectionReason, documentId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    // If all documents verified, mark provider as verified
    if (isVerified) {
      const providerId = result.rows[0].provider_id;
      const unverifiedDocs = await query(
        `SELECT COUNT(*) FROM provider_documents WHERE provider_id = $1 AND is_verified = false`,
        [providerId],
      );

      if (parseInt(unverifiedDocs.rows[0].count) === 0) {
        await query(
          `UPDATE providers SET is_verified = true, verification_date = CURRENT_TIMESTAMP WHERE id = $1`,
          [providerId],
        );

        await query(
          `UPDATE users SET is_approved = true WHERE id = (SELECT user_id FROM providers WHERE id = $1)`,
          [providerId],
        );
      }
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        "verify_document",
        "provider_document",
        documentId,
        JSON.stringify({ is_verified: isVerified }),
      ],
    );

    res.json({
      message: "Document verification updated",
      document: result.rows[0],
    });
  } catch (error) {
    console.error("Verify document error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload provider document (admin can upload on behalf)
export const uploadProviderDocument = async (req, res) => {
  try {
    const { providerId, documentType, filePath } = req.body;

    const result = await query(
      `INSERT INTO provider_documents (provider_id, document_type, file_path)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [providerId, documentType, filePath],
    );

    res
      .status(201)
      .json({ message: "Document uploaded", document: result.rows[0] });
  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
