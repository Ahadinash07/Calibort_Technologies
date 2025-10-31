# User Management System - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Installation & Setup](#installation--setup)
7. [API Documentation](#api-documentation)
8. [Frontend Features](#frontend-features)
9. [Troubleshooting](#troubleshooting)
10. [Deployment Guide](#deployment-guide)

---

## Project Overview

A full-stack user management system with authentication, CRUD operations, profile management, and external API integration.

### Key Features
- JWT-based authentication
- User CRUD operations with pagination and search
- Profile image upload with avatar support
- Import users from external API with fallback
- Responsive design for all devices
- Scrollable table with fixed headers
- Real-time form validation

---

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone and Install**
```bash
cd /Users/ahadinash/Desktop/CT
npm install
cd server && npm install
cd ../client && npm install
```

2. **Configure MySQL**
```bash
mysql -u root -p
CREATE DATABASE user_management;
```

3. **Configure Environment**
```bash
cp .env.example .env
```

Edit `.env` with your MySQL password:
```env
PORT=5001
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=user_management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
REQRES_API_URL=https://reqres.in/api
```

4. **Start Servers**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

5. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

---

## Features

### Authentication
- Secure registration with password hashing (bcrypt)
- JWT token-based authentication
- Token expiry handling (24 hours)
- Auto-redirect on authentication
- Protected routes

### User Management
- View all users with pagination (10 per page)
- Search users by name or email
- Create new users
- Edit user details
- Delete users with confirmation
- View detailed user information

### Profile Management
- View and edit personal profile
- Upload profile images (JPEG, PNG, GIF, WebP)
- Image size limit: 5MB
- Automatic old image cleanup
- Avatar display throughout the app

### External API Integration
- Import users from reqres.in API
- Automatic fallback to mock data if API fails
- Fetches all available pages (12 users)
- Duplicate prevention
- Detailed import feedback

### UI/UX Features
- Responsive design (mobile, tablet, laptop, desktop)
- Scrollable tables with fixed headers
- Loading states and spinners
- Toast notifications for all actions
- Form validation with error messages
- Smooth animations and transitions

---

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **File Upload**: multer
- **Validation**: express-validator
- **Security**: helmet, cors

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

---

## Project Structure

```
CT/
├── server/                    # Backend application
│   ├── config/
│   │   └── database.ts       # MySQL connection
│   ├── controllers/
│   │   ├── authController.ts # Authentication logic
│   │   └── userController.ts # User CRUD operations
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   ├── errorHandler.ts   # Error handling
│   │   └── upload.ts         # File upload config
│   ├── routes/
│   │   ├── authRoutes.ts     # Auth endpoints
│   │   └── userRoutes.ts     # User endpoints
│   ├── uploads/              # Uploaded images
│   ├── index.ts              # Server entry point
│   └── package.json
├── client/                    # Frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Reusable UI components
│   │   │   ├── Layout.tsx    # Main layout
│   │   │   └── PrivateRoute.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── UserDetail.tsx
│   │   │   ├── UserEdit.tsx
│   │   │   └── Profile.tsx
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   ├── authSlice.ts
│   │   │   └── usersSlice.ts
│   │   ├── utils/
│   │   │   └── api.ts        # Axios configuration
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── App.tsx
│   └── package.json
└── DOCUMENTATION.md           # This file
```

---

## Installation & Setup

### Step 1: MySQL Setup

1. Install MySQL (if not installed)
2. Start MySQL service
3. Create database:
```sql
CREATE DATABASE user_management;
```

4. The application will automatically create tables on first run

### Step 2: Backend Setup

1. Navigate to server directory:
```bash
cd server
npm install
```

2. Create `.env` file with your configuration

3. Start development server:
```bash
npm run dev
```

You should see:
```
✅ Database initialized successfully
🚀 Server is running on port 5001
```

### Step 3: Frontend Setup

1. Navigate to client directory:
```bash
cd client
npm install --legacy-peer-deps
```

2. Start development server:
```bash
npm start
```

Browser will open at http://localhost:3000

---

## API Documentation

### Base URL
```
http://localhost:5001/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": { ... }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": { ... }
  }
}
```

### User Endpoints (Protected)

All user endpoints require authentication header:
```
Authorization: Bearer <jwt_token>
```

#### Get All Users
```http
GET /api/users?page=1&limit=10&search=john

Response: 200 OK
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### Get User by ID
```http
GET /api/users/:id

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith"
}

Response: 201 Created
```

#### Update User
```http
PUT /api/users/:id
Content-Type: application/json

{
  "first_name": "Updated",
  "last_name": "Name"
}

Response: 200 OK
```

#### Delete User
```http
DELETE /api/users/:id

Response: 200 OK
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Profile Endpoints (Protected)

#### Get Current User Profile
```http
GET /api/users/profile/me

Response: 200 OK
```

#### Update Profile
```http
PUT /api/users/profile/me
Content-Type: application/json

{
  "first_name": "Updated",
  "last_name": "Name"
}

Response: 200 OK
```

#### Upload Profile Image
```http
POST /api/users/profile/upload
Content-Type: multipart/form-data

Form Data:
- avatar: <image_file>

Response: 200 OK
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "data": {
    "avatar": "/uploads/profile-xxx.jpeg"
  }
}
```

### External API Endpoint

#### Import Users from External API
```http
POST /api/users/fetch-external

Response: 200 OK
{
  "success": true,
  "message": "Successfully imported 12 users...",
  "data": {
    "imported": 12,
    "skipped": 0,
    "errors": 0,
    "total": 12,
    "usedFallback": false
  }
}
```

---

## Frontend Features

### Pages

1. **Login** (`/login`)
   - Email and password authentication
   - Form validation
   - Auto-redirect if already logged in

2. **Register** (`/register`)
   - User registration form
   - Password confirmation
   - Email validation

3. **Users List** (`/users`)
   - Paginated user list
   - Search functionality
   - Create new user button
   - Import from API button
   - Scrollable table with fixed header
   - Responsive card layout on mobile

4. **User Details** (`/users/:id`)
   - View complete user information
   - Edit and delete actions
   - Avatar display

5. **User Edit** (`/users/:id/edit`)
   - Edit user information
   - Form validation
   - Cancel and save actions

6. **Profile** (`/profile`)
   - View and edit personal profile
   - Upload profile image
   - Camera/gallery selection
   - Image preview

### Components

#### UI Components
- **Button**: Primary, secondary, danger variants
- **Input**: Text, email, password with icons
- **Card**: Container with shadow and border
- **Avatar**: User profile images with fallback
- **Modal**: Confirmation dialogs
- **Badge**: Status indicators

#### Layout Components
- **Layout**: Main app layout with navigation
- **PrivateRoute**: Protected route wrapper

### State Management

#### Auth Slice
- User authentication state
- Login/register actions
- Token management
- Profile updates

#### Users Slice
- Users list state
- CRUD operations
- Pagination state
- Search functionality

---

## Troubleshooting

### Common Issues

#### 1. Backend Won't Start

**Error**: `EADDRINUSE: address already in use :::5001`

**Solution**:
```bash
lsof -ti:5001 | xargs kill -9
npm run dev
```

#### 2. Database Connection Failed

**Error**: `Access denied for user 'root'@'localhost'`

**Solution**:
- Verify MySQL is running: `brew services list | grep mysql`
- Check password in `.env` file
- Ensure database exists: `CREATE DATABASE user_management;`

#### 3. Frontend Compilation Errors

**Error**: `Cannot find module 'ajv/dist/compile/codegen'`

**Solution**:
```bash
cd client
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### 4. Images Not Displaying

**Solution**:
- Restart backend server
- Hard refresh browser: `Cmd+Shift+R` or `Ctrl+Shift+R`
- Check CORS headers in Network tab
- Verify image URL: `http://localhost:5001/uploads/filename.jpg`

#### 5. Upload Failed

**Possible Causes**:
- File size > 5MB
- Invalid file type (only JPEG, PNG, GIF, WebP allowed)
- User not authenticated

**Solution**:
- Check file size and type
- Logout and login again
- Check server logs for detailed error

#### 6. External API Import Fails

**Error**: 401 Unauthorized from reqres.in

**Solution**:
- The system automatically uses fallback mock data
- 12 users will be imported from local data
- No action needed - feature works automatically

### Debug Mode

Enable detailed logging:

**Backend**:
Check server terminal for logs like:
```
Upload request received: { userId: 1, hasFile: true, ... }
Avatar updated successfully: /uploads/profile-xxx.jpeg
```

**Frontend**:
Open browser console (F12) and check for:
- Network requests
- Error messages
- Redux state changes

---

## Deployment Guide

### Prerequisites for Production

1. **Server Requirements**
   - Node.js 14+ installed
   - MySQL 8.0+ installed
   - SSL certificate for HTTPS
   - Domain name

2. **Environment Variables**
   - Strong JWT secret
   - Production database credentials
   - Secure CORS origins

### Backend Deployment

#### Option 1: VPS (DigitalOcean, AWS EC2, etc.)

1. **Setup Server**
```bash
ssh user@your-server-ip
sudo apt update && sudo apt upgrade
sudo apt install nodejs npm mysql-server nginx
```

2. **Clone and Install**
```bash
git clone your-repo-url
cd CT/server
npm install
```

3. **Configure Environment**
```bash
nano .env
```

Set production values:
```env
NODE_ENV=production
PORT=5001
DB_HOST=localhost
DB_USER=production_user
DB_PASSWORD=strong_password
DB_NAME=user_management_prod
JWT_SECRET=very-strong-secret-key
```

4. **Setup PM2**
```bash
npm install -g pm2
pm2 start dist/index.js --name user-management-api
pm2 startup
pm2 save
```

5. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Setup SSL**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

#### Option 2: Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

2. **Create App**
```bash
cd server
heroku create your-app-name
```

3. **Add MySQL**
```bash
heroku addons:create jawsdb:kitefin
```

4. **Configure Environment**
```bash
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production
```

5. **Deploy**
```bash
git push heroku main
```

### Frontend Deployment

#### Option 1: Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
cd client
vercel
```

3. **Configure Environment**
In Vercel dashboard, add:
```
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

#### Option 2: Netlify

1. **Build**
```bash
cd client
npm run build
```

2. **Deploy**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

3. **Configure Environment**
In Netlify dashboard, add environment variables

#### Option 3: Static Hosting (Nginx)

1. **Build**
```bash
cd client
npm run build
```

2. **Copy to Server**
```bash
scp -r build/* user@server:/var/www/html/
```

3. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Database Setup (Production)

1. **Create Database**
```sql
CREATE DATABASE user_management_prod;
CREATE USER 'prod_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON user_management_prod.* TO 'prod_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Backup Strategy**
```bash
mysqldump -u prod_user -p user_management_prod > backup.sql

crontab -e
0 2 * * * mysqldump -u prod_user -p user_management_prod > /backups/db-$(date +\%Y\%m\%d).sql
```

### Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Strong JWT secret (32+ characters)
- [ ] Secure database credentials
- [ ] Enable CORS only for specific origins
- [ ] Rate limiting on API endpoints
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (helmet middleware)
- [ ] Regular security updates
- [ ] Environment variables not in code
- [ ] Secure file upload validation
- [ ] Password complexity requirements

### Performance Optimization

1. **Backend**
   - Enable gzip compression
   - Add Redis for caching
   - Database indexing
   - Connection pooling

2. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - CDN for static assets

3. **Database**
   - Index frequently queried columns
   - Optimize queries
   - Regular maintenance

### Monitoring

1. **Application Monitoring**
   - PM2 monitoring
   - Error tracking (Sentry)
   - Performance monitoring (New Relic)

2. **Server Monitoring**
   - CPU and memory usage
   - Disk space
   - Network traffic

3. **Database Monitoring**
   - Query performance
   - Connection pool
   - Slow query log

---

## Additional Notes

### Default Credentials
After registration, use your own credentials. External imported users have default password: `password123`

### File Upload Limits
- Maximum file size: 5MB
- Allowed formats: JPEG, PNG, GIF, WebP
- Files stored in: `/server/uploads/`

### External API
- Source: https://reqres.in/api
- Fallback: Local mock data (12 users)
- Auto-retry: No (uses fallback immediately on failure)

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Support
- iOS Safari
- Android Chrome
- Responsive design for all screen sizes

---

## Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Check server logs for errors
   - Monitor disk space
   - Review failed login attempts

2. **Monthly**
   - Update dependencies
   - Database backup verification
   - Security audit

3. **Quarterly**
   - Performance review
   - User feedback analysis
   - Feature planning

### Backup Strategy

1. **Database**: Daily automated backups
2. **Uploads**: Weekly backup to cloud storage
3. **Code**: Version control (Git)

---

## License

This project is for educational/internal use.

---

## Version History

- **v1.0.0** - Initial release with all core features
  - User authentication
  - CRUD operations
  - Profile management
  - External API integration
  - Responsive design
  - Image upload

---

**For questions or issues, check the troubleshooting section or review server/browser logs for detailed error messages.**
