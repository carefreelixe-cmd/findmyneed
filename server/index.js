import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Razorpay from "razorpay";
import { OAuth2Client } from "google-auth-library";
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { z } from "zod";
const app = express(),
  PORT = process.env.PORT || 5000,
  SECRET = process.env.JWT_SECRET || "development-only-secret-change-me";
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL?.split(",") || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", rateLimit({ windowMs: 900000, max: 100 }));
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    phone: String,
    passwordHash: String,
    role: { type: String, enum: ["customer", "provider", "admin"], default: "customer" },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);
const serviceSchema = new mongoose.Schema({
  slug: { type: String, unique: true, sparse: true },
  name: String,
  category: String,
  description: String,
  basePrice: Number,
  icon: String,
  active: { type: Boolean, default: true },
});
const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    serviceId: String,
    serviceName: String,
    date: String,
    time: String,
    address: String,
    notes: String,
    amount: Number,
    status: { type: String, default: "pending" },
    paymentStatus: { type: String, default: "pending" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true },
);
const User = mongoose.model("User", userSchema),
  Service = mongoose.model("Service", serviceSchema),
  Booking = mongoose.model("Booking", bookingSchema);
let mongoReady = false;
const memory = { users: [], bookings: [] };
const catalog = [
  {
    _id: "electrician",
    name: "Electrician",
    category: "Home repair",
    description: "Safe electrical repairs and installations",
    basePrice: 299,
    icon: "⚡",
  },
  {
    _id: "plumber",
    name: "Plumber",
    category: "Home repair",
    description: "Leaks, fittings and plumbing emergencies",
    basePrice: 349,
    icon: "🔧",
  },
  {
    _id: "cleaning",
    name: "Home cleaning",
    category: "Cleaning",
    description: "Thorough, reliable home cleaning",
    basePrice: 499,
    icon: "✨",
  },
  {
    _id: "car",
    name: "Car repair",
    category: "Vehicle care",
    description: "Diagnostics, repairs and regular servicing",
    basePrice: 699,
    icon: "🚗",
  },
  {
    _id: "ac",
    name: "AC service & repair",
    category: "Appliance care",
    description: "Cleaning, cooling diagnosis, gas refill and repair",
    basePrice: 599,
    icon: "❄️",
  },
  {
    _id: "appliance",
    name: "Appliance repair",
    category: "Home repair",
    description: "Expert care for everyday appliances",
    basePrice: 449,
    icon: "🛠️",
  },
  {
    _id: "painter",
    name: "Painter",
    category: "Home improvement",
    description: "Clean finishes for homes and offices",
    basePrice: 799,
    icon: "🎨",
  },
];
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/findmyneed", {
    serverSelectionTimeoutMS: 3000,
  })
  .then(async () => {
    mongoReady = true;
    console.log("MongoDB connected");
    await Service.bulkWrite(
      catalog.map(({ _id, ...service }) => ({
        updateOne: {
          filter: { slug: _id },
          update: { $set: { ...service, slug: _id, active: true } },
          upsert: true,
        },
      })),
    );
  })
  .catch(() => console.warn("MongoDB unavailable: using in-memory store"));
let jobs = null;
if (process.env.REDIS_URL) {
  try {
    const connection = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
    jobs = new Queue("notifications", { connection });
    new Worker("notifications", async (j) => console.log(`[notification:${j.name}]`, j.data), {
      connection,
    });
  } catch {
    console.warn("Redis unavailable");
  }
}
async function notify(name, data) {
  if (jobs)
    return jobs.add(name, data, { attempts: 3, backoff: { type: "exponential", delay: 1000 } });
  console.log(`[notification:${name}]`, data);
}
const safe = (u) => ({
    id: String(u._id || u.id),
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    verified: u.verified,
  }),
  sign = (u) => jwt.sign({ id: String(u._id || u.id), role: u.role }, SECRET, { expiresIn: "7d" });
function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) throw 0;
    req.auth = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Please log in to continue." });
  }
}
function role(...roles) {
  return (req, res, next) =>
    roles.includes(req.auth.role)
      ? next()
      : res.status(403).json({ message: "You do not have access to this action." });
}
app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    mongodb: mongoReady,
    redis: Boolean(jobs),
    payments: Boolean(process.env.RAZORPAY_KEY_ID),
  }),
);
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const b = z
        .object({
          name: z.string().min(2),
          email: z.string().email(),
          phone: z.string().min(8),
          password: z.string().min(8),
          role: z.enum(["customer", "provider"]).default("customer"),
        })
        .parse(req.body),
      email = b.email.toLowerCase();
    const exists = mongoReady
      ? await User.findOne({ email })
      : memory.users.find((u) => u.email === email);
    if (exists)
      return res.status(409).json({ message: "An account with this email already exists." });
    const data = { ...b, email, passwordHash: await bcrypt.hash(b.password, 12) };
    delete data.password;
    const user = mongoReady ? await User.create(data) : { ...data, id: crypto.randomUUID() };
    if (!mongoReady) memory.users.push(user);
    await notify("welcome", { userId: String(user._id || user.id), email });
    res.status(201).json({ user: safe(user), token: sign(user) });
  } catch (e) {
    next(e);
  }
});
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const b = z.object({ email: z.string().email(), password: z.string() }).parse(req.body),
      email = b.email.toLowerCase();
    const user = mongoReady
      ? await User.findOne({ email })
      : memory.users.find((u) => u.email === email);
    if (!user || !(await bcrypt.compare(b.password, user.passwordHash)))
      return res.status(401).json({ message: "Email or password is incorrect." });
    res.json({ user: safe(user), token: sign(user) });
  } catch (e) {
    next(e);
  }
});
app.post("/api/auth/google", async (req, res, next) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID)
      return res.status(503).json({ message: "Google sign-in is not configured yet." });
    const ticket = await new OAuth2Client(process.env.GOOGLE_CLIENT_ID).verifyIdToken({
        idToken: req.body.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      }),
      p = ticket.getPayload(),
      email = p.email.toLowerCase();
    let user = mongoReady
      ? await User.findOne({ email })
      : memory.users.find((u) => u.email === email);
    if (!user) {
      const data = {
        name: p.name,
        email,
        phone: "Google account",
        passwordHash: await bcrypt.hash(crypto.randomUUID(), 12),
        role: "customer",
        verified: true,
      };
      user = mongoReady ? await User.create(data) : { ...data, id: crypto.randomUUID() };
      if (!mongoReady) memory.users.push(user);
    }
    res.json({ user: safe(user), token: sign(user) });
  } catch (e) {
    next(e);
  }
});
app.get("/api/auth/me", auth, async (req, res) => {
  const user = mongoReady
    ? await User.findById(req.auth.id)
    : memory.users.find((u) => u.id === req.auth.id);
  user ? res.json({ user: safe(user) }) : res.status(404).json({ message: "Account not found." });
});
app.get("/api/services", async (req, res) => {
  if (!mongoReady) return res.json({ services: catalog });
  const services = await Service.find({ active: true }).lean();
  res.json({
    services: services.map((service) => ({
      ...service,
      _id: service.slug || String(service._id),
    })),
  });
});
app.get("/api/services/:id", async (req, res) => {
  let service = mongoReady
    ? await Service.findOne({ slug: req.params.id }).lean()
    : catalog.find((s) => s._id === req.params.id);
  if (!service && mongoReady && mongoose.isValidObjectId(req.params.id)) {
    service = await Service.findById(req.params.id).lean();
  }
  if (service?.slug) service = { ...service, _id: service.slug };
  service ? res.json({ service }) : res.status(404).json({ message: "Service not found." });
});
app.get("/api/vehicles/makes", async (req, res) => {
  try {
    const r = await fetch(
        "https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json",
      ),
      d = await r.json();
    res.json({ makes: d.Results.map((x) => x.MakeName).sort() });
  } catch {
    res.json({
      makes: [
        "Hyundai",
        "Maruti Suzuki",
        "Tata",
        "Mahindra",
        "Toyota",
        "Honda",
        "Kia",
        "Skoda",
        "Volkswagen",
        "Renault",
        "Nissan",
        "MG",
        "BMW",
        "Mercedes-Benz",
        "Audi",
      ],
    });
  }
});
app.get("/api/vehicles/models/:make", async (req, res) => {
  try {
    const r = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(req.params.make)}?format=json`,
      ),
      d = await r.json();
    res.json({ models: d.Results.map((x) => x.Model_Name).sort() });
  } catch {
    res.json({ models: [] });
  }
});
app.post("/api/bookings", auth, role("customer"), async (req, res, next) => {
  try {
    const b = z
        .object({
          serviceId: z.string(),
          serviceName: z.string(),
          date: z.string().min(1),
          time: z.string().min(1),
          address: z.string().min(5),
          notes: z.string().optional(),
          amount: z.number().positive(),
        })
        .parse(req.body),
      data = { ...b, customer: req.auth.id, status: "pending", paymentStatus: "pending" };
    const booking = mongoReady
      ? await Booking.create(data)
      : { ...data, _id: crypto.randomUUID(), createdAt: new Date() };
    if (!mongoReady) memory.bookings.push(booking);
    await notify("booking-created", {
      bookingId: String(booking._id),
      service: booking.serviceName,
    });
    res.status(201).json({ booking });
  } catch (e) {
    next(e);
  }
});
app.get("/api/bookings", auth, async (req, res) => {
  const filter =
    req.auth.role === "customer"
      ? { customer: req.auth.id }
      : req.auth.role === "provider"
        ? { status: { $in: ["pending", "confirmed", "in_progress", "completed"] } }
        : {};
  const bookings = mongoReady
    ? await Booking.find(filter).sort({ createdAt: -1 }).lean()
    : memory.bookings
        .filter((b) => (req.auth.role === "customer" ? String(b.customer) === req.auth.id : true))
        .reverse();
  res.json({ bookings });
});
app.patch("/api/bookings/:id/status", auth, role("provider", "admin"), async (req, res) => {
  if (!["confirmed", "in_progress", "completed", "cancelled"].includes(req.body.status))
    return res.status(400).json({ message: "Invalid status." });
  let booking;
  if (mongoReady)
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, provider: req.auth.id },
      { new: true },
    );
  else {
    booking = memory.bookings.find((b) => b._id === req.params.id);
    if (booking) {
      booking.status = req.body.status;
      booking.provider = req.auth.id;
    }
  }
  if (!booking) return res.status(404).json({ message: "Booking not found." });
  await notify("booking-status", { bookingId: req.params.id, status: req.body.status });
  res.json({ booking });
});
const razor =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;
const getBooking = (id) =>
  mongoReady ? Booking.findById(id) : memory.bookings.find((b) => b._id === id);
app.post("/api/payments/order", auth, role("customer"), async (req, res) => {
  const b = await getBooking(req.body.bookingId);
  if (!b) return res.status(404).json({ message: "Booking not found." });
  if (String(b.customer) !== req.auth.id)
    return res.status(403).json({ message: "This booking belongs to another account." });
  if (!razor) return res.json({ demo: true });
  const order = await razor.orders.create({
    amount: Math.round(b.amount * 100),
    currency: "INR",
    receipt: `fmn_${String(b._id).slice(-12)}`,
  });
  b.razorpayOrderId = order.id;
  await b.save();
  res.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
});
app.post("/api/payments/verify", auth, role("customer"), async (req, res) => {
  const b = await getBooking(req.body.bookingId);
  if (!b) return res.status(404).json({ message: "Booking not found." });
  if (!req.body.demo) {
    const payload = `${req.body.razorpay_order_id}|${req.body.razorpay_payment_id}`,
      expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest("hex");
    if (expected !== req.body.razorpay_signature)
      return res.status(400).json({ message: "Payment signature is invalid." });
    b.razorpayPaymentId = req.body.razorpay_payment_id;
  }
  b.paymentStatus = "paid";
  if (mongoReady) await b.save();
  await notify("payment-received", { bookingId: String(b._id), amount: b.amount });
  res.json({ verified: true, booking: b });
});
app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof z.ZodError)
    return res.status(400).json({ message: err.issues[0]?.message || "Invalid input." });
  res.status(500).json({ message: "Something went wrong. Please try again." });
});
app.listen(PORT, () => console.log(`FindMyNeed API running on http://localhost:${PORT}`));
