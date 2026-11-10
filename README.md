# Services Marketplace Platform

A comprehensive full-stack marketplace platform for connecting service providers with customers.

## 🚀 Features

### Admin Panel
- Dashboard with analytics and statistics
- Provider approval/rejection system
- Customer management
- Booking oversight and control
- Content management (categories, banners, pages)
- Activity logs and reports

### Provider Dashboard
- Business profile management
- Service listing and management
- Booking request management (accept/reject)
- Review responses
- Performance analytics

### Customer Features
- Advanced search with filters (location, category, rating)
- Provider profiles with reviews
- Easy booking system
- Booking history and tracking
- Review and rating system

## 🛠️ Tech Stack

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Icons** for UI icons

### Backend
- **Node.js** with **Express.js**
- **PostgreSQL** database
- **JWT** authentication
- **Bcrypt** for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd MaderChod
\`\`\`

### 2. Database Setup

1. Install PostgreSQL and create a database:
\`\`\`sql
CREATE DATABASE services_marketplace;
\`\`\`

2. Run the schema file to create tables:
\`\`\`bash
psql -U postgres -d services_marketplace -f server/database/schema.sql
\`\`\`

### 3. Backend Setup

\`\`\`bash
cd server
npm install
\`\`\`

Create a \`.env\` file in the server directory (copy from \`.env.example\`):
\`\`\`bash
cp .env.example .env
\`\`\`

Update the \`.env\` file with your database credentials:
\`\`\`env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=services_marketplace
JWT_SECRET=your_secure_secret_key
\`\`\`

Start the backend server:
\`\`\`bash
npm start
\`\`\`

Server will run on http://localhost:5000

### 4. Frontend Setup

\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

Frontend will run on http://localhost:5173

## 🔐 Default Credentials

**Admin Account:**
- Email: admin@marketplace.com
- Password: admin123

## 📁 Project Structure

\`\`\`
MaderChod/
├── client/                 # React frontend
│   ├── src/
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   │   ├── admin/    # Admin dashboard
│   │   │   ├── provider/ # Provider dashboard
│   │   │   └── customer/ # Customer pages
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
│
├── server/                # Express backend
│   ├── config/           # Database config
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth middleware
│   ├── routes/           # API routes
│   ├── database/         # SQL schema
│   └── server.js         # Entry point
│
└── README.md
\`\`\`

## 🔌 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Admin
- GET `/api/admin/dashboard` - Dashboard statistics
- GET `/api/admin/providers` - List all providers
- PATCH `/api/admin/providers/:id/status` - Approve/reject provider
- GET `/api/admin/customers` - List all customers
- GET `/api/admin/bookings` - List all bookings

### Provider
- GET `/api/provider/profile` - Get provider profile
- PATCH `/api/provider/profile` - Update profile
- GET `/api/provider/services` - List provider services
- POST `/api/provider/services` - Create service
- PATCH `/api/provider/services/:id` - Update service
- GET `/api/provider/bookings` - List bookings
- PATCH `/api/provider/bookings/:id/status` - Update booking status

### Customer
- GET `/api/customer/categories` - List categories
- GET `/api/customer/providers/search` - Search providers
- GET `/api/customer/providers/:id` - Get provider details
- POST `/api/customer/bookings` - Create booking
- GET `/api/customer/bookings` - List customer bookings
- POST `/api/customer/reviews` - Submit review

## 🚀 Development Workflow

1. **Start PostgreSQL** database
2. **Run backend**: \`cd server && npm start\`
3. **Run frontend**: \`cd client && npm run dev\`
4. Access the application at http://localhost:5173

## 📝 Future Enhancements

- Payment integration (Stripe/Razorpay)
- Real-time notifications
- Advanced search with Meilisearch/Elasticsearch
- File upload for provider documents
- Email notifications (AWS SES/SMTP)
- Mobile app (React Native)
- Advanced analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Developed by Freelixe (StudyBloom 24 LLP)

## 📧 Contact

For support: support@freelixe.com
