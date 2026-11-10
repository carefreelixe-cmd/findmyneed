import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaImage,
  FaQuestion,
  FaFileAlt,
  FaPercentage,
  FaBell,
  FaNewspaper,
  FaStar,
  FaCheckCircle,
} from "react-icons/fa";

export default function AdminFeaturesMenu() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      <Link
        to="/admin/banners"
        className="card-elevated hover:shadow-lg transition border-t-4 border-t-blue-600"
      >
        <div className="flex items-center space-x-4">
          <FaImage className="text-3xl text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Banners</h3>
            <p className="text-sm text-gray-600">Manage homepage banners</p>
          </div>
        </div>
      </Link>

      <Link
        to="/admin/faqs"
        className="card-elevated hover:shadow-lg transition border-t-4 border-t-green-600"
      >
        <div className="flex items-center space-x-4">
          <FaQuestion className="text-3xl text-green-600" />
          <div>
            <h3 className="font-semibold text-gray-900">FAQs</h3>
            <p className="text-sm text-gray-600">Manage FAQs</p>
          </div>
        </div>
      </Link>

      <Link
        to="/admin/pages"
        className="card-elevated hover:shadow-lg transition border-t-4 border-t-purple-600"
      >
        <div className="flex items-center space-x-4">
          <FaFileAlt className="text-3xl text-purple-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Pages</h3>
            <p className="text-sm text-gray-600">Manage CMS pages</p>
          </div>
        </div>
      </Link>

      <Link
        to="/admin/commissions"
        className="card-elevated hover:shadow-lg transition border-t-4 border-t-orange-600"
      >
        <div className="flex items-center space-x-4">
          <FaPercentage className="text-3xl text-orange-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Commissions</h3>
            <p className="text-sm text-gray-600">Set fees & commissions</p>
          </div>
        </div>
      </Link>

      <Link
        to="/admin/notifications"
        className="card-elevated hover:shadow-lg transition border-t-4 border-t-red-600"
      >
        <div className="flex items-center space-x-4">
          <FaBell className="text-3xl text-red-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-600">Send system alerts</p>
          </div>
        </div>
      </Link>

      <Link
        to="/admin/blog"
        className="card-elevated hover:shadow-lg transition border-t-4 border-t-pink-600"
      >
        <div className="flex items-center space-x-4">
          <FaNewspaper className="text-3xl text-pink-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Blog</h3>
            <p className="text-sm text-gray-600">Manage blog posts</p>
          </div>
        </div>
      </Link>

      <Link
        to="/admin/reviews"
        className="card-elevated hover:shadow-lg transition border-t-4 border-t-yellow-600"
      >
        <div className="flex items-center space-x-4">
          <FaStar className="text-3xl text-yellow-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Reviews</h3>
            <p className="text-sm text-gray-600">Moderate reviews</p>
          </div>
        </div>
      </Link>

      <Link
        to="/admin/verification"
        className="card-elevated hover:shadow-lg transition border-t-4 border-t-teal-600"
      >
        <div className="flex items-center space-x-4">
          <FaCheckCircle className="text-3xl text-teal-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Verification</h3>
            <p className="text-sm text-gray-600">Verify providers</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
