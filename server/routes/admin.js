import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getDashboardStats,
  getAllProviders,
  updateProviderStatus,
  getAllCustomers,
  getAllBookings,
  toggleUserStatus,
  getAnalytics,
  getCategories,
  addCategory,
  deleteCategory,
  getReviews,
  moderateReview,
  deleteReview,
  getActivityLogs,
  updateBookingStatus,
  deactivateProvider,
  bulkImportBusinesses,
  createBusiness,
  editBusiness,
  getBusinessDetails,
  getAllServices,
  deleteBusiness,
  getPendingDocuments,
  getProviderDocuments,
  verifyProviderDocument,
  uploadProviderDocument
} from '../controllers/adminController.js';

const router = express.Router();

// Protect all admin routes
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Providers
router.get('/providers', getAllProviders);
router.patch('/providers/:id/status', updateProviderStatus);
router.patch('/providers/:id/deactivate', deactivateProvider);

// Customers
router.get('/customers', getAllCustomers);
router.patch('/customers/:id/status', toggleUserStatus);

// Bookings
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', updateBookingStatus);

// Categories
router.get('/categories', getCategories);
router.post('/categories', addCategory);
router.delete('/categories/:id', deleteCategory);

// Reviews
router.get('/reviews', getReviews);
router.patch('/reviews/:id/moderate', moderateReview);
router.delete('/reviews/:id', deleteReview);

// Provider Documents & Verification
router.get('/documents/pending', getPendingDocuments);
router.get('/providers/:providerId/documents', getProviderDocuments);
router.patch('/documents/:documentId/verify', verifyProviderDocument);
router.post('/documents/upload', uploadProviderDocument);

// Analytics
router.get('/analytics', getAnalytics);

// Activity Logs
router.get('/activity-logs', getActivityLogs);

// Business Management (Provider CRUD)
router.get('/services', getAllServices);
router.post('/businesses/bulk-import', bulkImportBusinesses);
router.post('/businesses', createBusiness);
router.put('/businesses/:id', editBusiness);
router.get('/businesses/:id', getBusinessDetails);
router.delete('/businesses/:id', deleteBusiness);


export default router;
