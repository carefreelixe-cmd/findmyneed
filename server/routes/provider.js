import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getProviderProfile,
  updateProviderProfile,
  getProviderServices,
  createService,
  updateService,
  deleteService,
  getProviderBookings,
  updateBookingStatus,
  getProviderReviews,
  respondToReview
} from '../controllers/providerController.js';

const router = express.Router();

// Protect all provider routes
router.use(authenticate);
router.use(authorize('provider'));

// Profile
router.get('/profile', getProviderProfile);
router.patch('/profile', updateProviderProfile);

// Services
router.get('/services', getProviderServices);
router.post('/services', createService);
router.patch('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Bookings
router.get('/bookings', getProviderBookings);
router.patch('/bookings/:id/status', updateBookingStatus);

// Reviews
router.get('/reviews', getProviderReviews);
router.post('/reviews/:id/respond', respondToReview);

export default router;
