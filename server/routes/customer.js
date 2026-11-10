import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  searchProviders,
  getProviderById,
  createBooking,
  getCustomerBookings,
  cancelBooking,
  createReview,
  getCategories,
  getServicesByCategory
} from '../controllers/customerController.js';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/categories/:categoryId/services', getServicesByCategory);
router.get('/providers/search', searchProviders);
router.get('/providers/:id', getProviderById);

// Protected customer routes
router.use(authenticate);
router.use(authorize('customer'));

router.post('/bookings', createBooking);
router.get('/bookings', getCustomerBookings);
router.patch('/bookings/:id/cancel', cancelBooking);
router.post('/reviews', createReview);

export default router;
