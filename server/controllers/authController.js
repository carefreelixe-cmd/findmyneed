import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query, withTransaction } from "../config/database.js";

// Register User
export const register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone } = req.body;

    // Validation
    if (!email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await withTransaction(async (client) => {
      const result = await client.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, role, first_name, last_name, is_approved`,
        [
          email,
          hashedPassword,
          role,
          firstName,
          lastName,
          phone,
          role === "customer",
        ],
      );
      const createdUser = result.rows[0];

      if (role === "provider") {
        await client.query(
          "INSERT INTO providers (user_id, business_name) VALUES ($1, $2)",
          [createdUser.id, `${firstName} ${lastName}'s Business`],
        );
      }

      const notification = await client.query(
        `INSERT INTO notifications (user_id, type, subject, message)
         VALUES ($1, 'email', $2, $3) RETURNING id`,
        [
          createdUser.id,
          role === "provider"
            ? "Professional application received"
            : "Welcome to FindMyNeed",
          role === "provider"
            ? "Your professional account is awaiting verification."
            : "Your customer account is ready.",
        ],
      );

      await client.query(
        `INSERT INTO outbox_events (topic, aggregate_type, aggregate_id, payload)
         VALUES ('notification.send', 'user', $1, $2)`,
        [
          createdUser.id,
          {
            notificationId: notification.rows[0].id,
            templateKey: role === "provider" ? "provider_pending" : "welcome",
            data: {
              firstName,
              dashboardUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/${role}`,
            },
          },
        ],
      );

      return createdUser;
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
    );

    res.status(201).json({
      message:
        role === "provider"
          ? "Registration successful. Awaiting admin approval."
          : "Registration successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        isApproved: user.is_approved,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Get user
    const result = await query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.first_name, u.last_name, u.is_active, u.is_approved,
              p.id as provider_id, p.business_name
       FROM users u
       LEFT JOIN providers p ON u.id = p.user_id
       WHERE u.email = $1`,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if active
    if (!user.is_active) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    // Check if approved (for providers)
    if (user.role === "provider" && !user.is_approved) {
      return res.status(403).json({
        message: "Your account is pending admin approval",
      });
    }

    // Update last login
    await query(
      "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id],
    );

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        isApproved: user.is_approved,
        providerId: user.provider_id,
        businessName: user.business_name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.phone, u.is_approved,
              p.id as provider_id, p.business_name, p.rating, p.total_reviews
       FROM users u
       LEFT JOIN providers p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      isApproved: user.is_approved,
      providerId: user.provider_id,
      businessName: user.business_name,
      rating: user.rating,
      totalReviews: user.total_reviews,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
