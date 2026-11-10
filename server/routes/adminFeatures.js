import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getAllBanners, createBanner, updateBanner, deleteBanner,
  getAllFAQs, createFAQ, updateFAQ, deleteFAQ,
  getAllPages, createPage, updatePage, deletePage,
  getAllCommissions, createCommission, updateCommission, deleteCommission,
  getAllNotifications, sendNotification, deleteNotification,
  getAllBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost
} from '../controllers/adminFeaturesController.js';

const router = express.Router();

// All routes require authentication and admin authorization
router.use(authenticate);
router.use(authorize('admin'));

// ====================================================================
// BANNERS ROUTES
// ====================================================================
router.get('/banners', getAllBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

// ====================================================================
// FAQs ROUTES
// ====================================================================
router.get('/faqs', getAllFAQs);
router.post('/faqs', createFAQ);
router.put('/faqs/:id', updateFAQ);
router.delete('/faqs/:id', deleteFAQ);

// ====================================================================
// PAGES ROUTES
// ====================================================================
router.get('/pages', getAllPages);
router.post('/pages', createPage);
router.put('/pages/:id', updatePage);
router.delete('/pages/:id', deletePage);

// ====================================================================
// COMMISSIONS ROUTES
// ====================================================================
router.get('/commissions', getAllCommissions);
router.post('/commissions', createCommission);
router.put('/commissions/:id', updateCommission);
router.delete('/commissions/:id', deleteCommission);

// ====================================================================
// SYSTEM NOTIFICATIONS ROUTES
// ====================================================================
router.get('/notifications', getAllNotifications);
router.post('/notifications', sendNotification);
router.delete('/notifications/:id', deleteNotification);

// ====================================================================
// BLOG POSTS ROUTES
// ====================================================================
router.get('/blog-posts', getAllBlogPosts);
router.post('/blog-posts', createBlogPost);
router.put('/blog-posts/:id', updateBlogPost);
router.delete('/blog-posts/:id', deleteBlogPost);

export default router;
