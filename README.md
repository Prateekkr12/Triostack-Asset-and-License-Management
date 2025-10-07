# Triostack Asset & License Manager

A comprehensive full-stack web application for tracking, assigning, and managing both physical and digital assets including laptops, monitors, software licenses, domain names, and hosting subscriptions.

## 🚀 Features

- **Asset Management**: Track hardware, software, domains, and hosting subscriptions
- **Role-based Access**: Admin, HR, and Employee roles with different permissions
- **Allocation System**: Assign and track asset assignments to users
- **Expiry Tracking**: Automated notifications for license renewals
- **Dashboard Analytics**: Comprehensive overview of assets and allocations
- **Responsive Design**: Modern UI built with Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with role-based access control
- **API**: RESTful APIs with React Query for state management

## 📁 Project Structure

```
triostack-asset-license-manager/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Authentication & validation
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── app.ts           # Express app setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # Next.js application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Next.js pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── .env.example             # Environment variables template
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd triostack-asset-license-manager
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   ```bash
   # Backend environment is already configured with your MongoDB URI
   # Frontend environment is automatically set up
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API on `http://localhost:8000`
   - Frontend app on `http://localhost:3000`

### 🎯 Demo Access

**Login Credentials:**
- Email: `admin@triostack.com`
- Password: `admin123`

**Demo Data:**
- 3 sample assets (Hardware, Software, Domain)
- Admin user with full permissions
- Ready-to-use asset management system

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/triostack-asset-manager

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=8000
NODE_ENV=development

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 👥 User Roles

### Admin
- Full CRUD access to all assets, users, and allocations
- View all reports and analytics
- Manage system settings

### HR
- Create and manage asset allocations
- View all assets and users
- Generate allocation reports

### Employee
- View assigned assets
- Request asset returns
- View personal asset history

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token

### Assets
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create new asset
- `GET /api/assets/:id` - Get asset by ID
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Allocations
- `GET /api/allocations` - Get all allocations
- `POST /api/allocations` - Create new allocation
- `PUT /api/allocations/:id` - Update allocation
- `DELETE /api/allocations/:id` - Delete allocation

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## 🚀 Deployment

### ✅ Ready for Production!

The application is fully configured and ready for deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

**Quick Deploy Options:**

1. **Frontend (Vercel)**: Connect GitHub repo → Auto-deploy
2. **Backend (Render)**: Connect GitHub repo → Set env vars → Deploy
3. **Database**: Already configured with MongoDB Atlas

**Environment Variables:**
- Backend: Already configured with your MongoDB URI
- Frontend: Automatically points to localhost for development

### 🐳 Docker Deployment

```bash
# Single command deployment
docker-compose up -d
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, email support@triostack.com or create an issue in the repository.
