import express from "express";
import {
  getCategories,
  getHealth,
  getHome,
  getLocations,
  searchMarketplace,
} from "../controllers/marketplaceController.js";

const router = express.Router();

router.get("/health", getHealth);
router.get("/home", getHome);
router.get("/categories", getCategories);
router.get("/locations", getLocations);
router.get("/search", searchMarketplace);

export default router;
