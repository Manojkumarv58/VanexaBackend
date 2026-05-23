# Vanexa Backend

E-commerce backend built with Node.js, Express, and PostgreSQL.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Then update the `.env` file with your credentials:
- Database URL (PostgreSQL)
- JWT Secret Key
- SMTP credentials (for email)
- Cloudinary credentials (for image uploads)
- Razorpay credentials (for payments)
- Gemini API key (for AI search)

### 3. Database Setup
The application will automatically create tables on first run.

To seed the database with sample products:
```bash
node utils/seedProducts.js
```

### 4. Run Server
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on `http://localhost:4000`

## 📁 Project Structure
```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── database/        # Database connection
├── middlewares/     # Express middlewares
├── models/          # Database models
├── router/          # API routes
├── utils/           # Utility functions
├── uploads/         # Temporary file uploads
├── .env             # Environment variables (not in git)
├── .env.example     # Example env file
└── app.js           # Express app setup
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | Yes |
| `COOKIE_EXPIRES_IN` | Cookie expiration (days) | Yes |
| `SMTP_MAIL` | Email for sending mails | Yes |
| `SMTP_PASSWORD` | Email app password | Yes |
| `CLOUDINARY_CLIENT_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_CLIENT_API` | Cloudinary API key | Yes |
| `CLOUDINARY_CLIENT_SECRET` | Cloudinary API secret | Yes |
| `RAZORPAY_KEY_ID` | Razorpay key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |

## 📦 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update profile
- `POST /api/v1/auth/password/forgot` - Forgot password
- `PUT /api/v1/auth/password/reset/:token` - Reset password

### Products
- `GET /api/v1/product` - Get all products (with filters)
- `GET /api/v1/product/singleProduct/:id` - Get single product
- `POST /api/v1/product/ai-search` - AI-powered product search
- `PUT /api/v1/product/post-new/review/:id` - Add/update review
- `DELETE /api/v1/product/delete/review/:id` - Delete review

### Orders
- `POST /api/v1/order/new` - Create new order
- `GET /api/v1/order/orders/me` - Get user orders
- `GET /api/v1/order/:id` - Get order details
- `PUT /api/v1/order/:id/cancel` - Cancel order

### Payment
- `POST /api/v1/payment/verify-payment` - Verify Razorpay payment

### Admin Routes
- `POST /api/v1/product/admin/create` - Create product
- `PUT /api/v1/product/admin/update/:id` - Update product
- `DELETE /api/v1/product/admin/delete/:id` - Delete product
- `GET /api/v1/order/admin/getall` - Get all orders
- `PUT /api/v1/order/admin/update/:id` - Update order status
- `GET /api/v1/admin/getallUsers` - Get all users
- `DELETE /api/v1/admin/delete/:id` - Delete user
- `GET /api/v1/admin/fetch/dashboard-stats` - Get dashboard stats

## 🛠️ Technologies Used
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Razorpay** - Payment gateway
- **Nodemailer** - Email service
- **Google Gemini** - AI search

## 📝 Notes
- Make sure PostgreSQL is running
- Never commit `.env` file to git
- Use `.env.example` as reference for required variables
- Run seed script to populate database with sample data

## 🔒 Security
- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS enabled for frontend
- Input validation on all routes
- SQL injection prevention using parameterized queries

## 📄 License
ISC
