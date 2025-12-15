# Enhanced Stock Management System

This document describes the complete stock management system with authentication, role-based access control, and advanced features.

## Features Implemented

### 1. Authentication System
- **User Login**: Secure login with username/password
- **Role-Based Access Control**: Different access levels for different user types
- **Session Management**: JWT-based authentication with HTTP-only cookies
- **Logout**: Secure logout with token clearing

### User Roles
- **ADMIN**: Full system access, user management, and all modules
- **STOCK_MANAGER**: Access to stock management, offers, and analytics
- **PRODUCT_CODE_MANAGER**: Access to product code management
- **USER**: Basic access to collections (public access)

### 2. Enhanced Stock Management
- **Client Selection**: Select clients when creating stock entries
- **Product Integration**: Select products from existing collections
- **Detailed Stock Entry**: Include department, region, quantity, and various flags
- **Advanced Filtering**: Filter by client code, category, department, region, status
- **Pagination**: Efficient data loading with pagination
- **Search**: Full-text search across stock entries

### Stock Entry Features
- **Client Code**: Link stock to specific clients
- **Product Selection**: Choose from existing product catalog
- **Department & Region**: Organize stock by location
- **Quantity Management**: Track incoming quantities
- **Set Completion**: Mark if stock set is complete (lid, body, etc.)
- **Expiration Tracking**: 2, 5, or 10-year expiration periods
- **Notes**: Add additional information to stock entries

### 3. Stock Offering System
- **Create Offers**: Offer stock to specific clients
- **Freeze Functionality**: Stock is frozen while offered
- **Expiry Management**: Offers expire after specified days (1-30 days)
- **Approval Workflow**: Approve, reject, or cancel offers
- **Quantity Tracking**: Prevent over-offering of available stock

### 4. Expiration Reminder System
- **Automatic Detection**: System identifies expiring stock
- **Configurable Periods**: 2, 5, 10-year expiration tracking
- **Alert Categories**: 
  - Expired stock
  - Expiring within 7 days
  - Expiring within 30 days
  - Expiring within 90 days
- **Notification System**: Send reminders for expiring stock

### 5. Advanced Filtering & Search
- **Multi-field Search**: Search across client codes, notes, product info
- **Filter Options**:
  - Client Code
  - Category
  - Department
  - Region
  - Stock Status
- **Real-time Filtering**: Instant filter application
- **Pagination Support**: Efficient data loading for large datasets

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/users` - List users (admin only)
- `POST /api/auth/users` - Create user (admin only)

### Stock Management
- `GET /api/stock/enhanced` - Get stock entries with filtering
- `POST /api/stock/enhanced` - Create new stock entry
- `GET /api/stock/products` - Get products for stock selection
- `GET /api/stock/offers` - Get stock offers
- `POST /api/stock/offers` - Create stock offer
- `PUT /api/stock/offers` - Update offer status
- `GET /api/stock/reminders` - Get expiration reminders
- `POST /api/stock/reminders` - Send reminder notifications

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'STOCK_MANAGER', 'PRODUCT_CODE_MANAGER', 'USER')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Stock Entries Table
```sql
CREATE TABLE stock_entries (
  id TEXT PRIMARY KEY,
  client_code TEXT NOT NULL,
  design_code TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  department TEXT,
  region TEXT,
  quantity_in INTEGER NOT NULL,
  is_stock_in_set_complete BOOLEAN DEFAULT false,
  is_lid BOOLEAN DEFAULT false,
  is_body BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'low_stock', 'out_of_stock')),
  notes TEXT,
  expiration_years INTEGER DEFAULT 2,
  expiration_date TIMESTAMP,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Stock Offers Table
```sql
CREATE TABLE stock_offers (
  id TEXT PRIMARY KEY,
  stock_entry_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'cancelled')),
  offer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiry_date TIMESTAMP NOT NULL,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stock_entry_id) REFERENCES stock_entries(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Clients Table
```sql
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  client_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Frontend Components

### Pages
- `/login` - Login page with role-based redirect
- `/unauthorized` - Access denied page
- `/admin` - User management (admin only)
- `/stock/enhanced` - Advanced stock management
- `/` - Collections (public access)

### Navigation
- **User Menu**: Shows user info, role, and logout
- **Role-based Navigation**: Different menu items based on user role
- **Authentication State**: Real-time authentication status
- **Responsive Design**: Mobile-friendly navigation

## Default Users

After running the seed script, the following users are created:

### Admin User
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `ADMIN`
- **Access**: Full system access

### Stock Manager User
- **Username**: `stockmanager`
- **Password**: `stock123`
- **Role**: `STOCK_MANAGER`
- **Access**: Stock management, offers, analytics

### Product Code Manager User
- **Username**: `productmanager`
- **Password**: `product123`
- **Role**: `PRODUCT_CODE_MANAGER`
- **Access**: Product code management

### Test Client
- **Client Code**: `TEST001`
- **Name**: `Test Client`
- **Email**: `test@client.com`

## Security Features

### Authentication
- **Password Hashing**: bcrypt for secure password storage
- **JWT Tokens**: Secure token-based authentication
- **HTTP-only Cookies**: Prevent XSS attacks
- **Token Expiration**: 24-hour token expiry

### Authorization
- **Role-based Access**: Middleware enforces role permissions
- **Route Protection**: Protected routes require authentication
- **API Security**: All API endpoints validate authentication
- **Input Validation**: Zod schema validation for all inputs

## Usage Instructions

### 1. Setup
```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Seed initial users
npm run db:seed

# Start development server
npm run dev
```

### 2. Login
1. Navigate to `/login`
2. Use appropriate credentials based on role:
   - Admin: `admin` / `admin123`
   - Stock Manager: `stockmanager` / `stock123`
   - Product Manager: `productmanager` / `product123`

### 3. Stock Management
1. Go to `/stock/enhanced`
2. Click "Add Stock Entry"
3. Select product from catalog
4. Fill in stock details (client code, quantity, etc.)
5. Save to create stock entry

### 4. Stock Offering
1. From stock overview, click "Offer" on any stock item
2. Enter client ID and quantity
3. Set expiry period (1-30 days)
4. Create offer - stock will be frozen during offer period

### 5. Offer Management
1. Go to "Stock Offers" tab
2. Review pending offers
3. Approve or reject offers as needed
4. System automatically handles expired offers

## Technical Details

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL for user/stock data, MySQL for product catalog
- **UI**: Tailwind CSS, shadcn/ui components
- **Authentication**: JWT with bcrypt password hashing

### Performance Features
- **Pagination**: Efficient data loading for large datasets
- **Optimized Queries**: Database indexes and efficient joins
- **Caching**: Browser caching for static assets
- **Responsive Design**: Mobile-first responsive UI

### Error Handling
- **Validation**: Comprehensive input validation
- **Error Boundaries**: React error boundaries
- **Toast Notifications**: User-friendly error messages
- **Graceful Degradation**: Fallbacks for failed operations

## Future Enhancements

### Planned Features
- **Email Notifications**: Automatic email for expiring stock
- **Advanced Analytics**: Stock movement reports and trends
- **Barcode Scanning**: Mobile stock scanning
- **Mobile App**: Native mobile application
- **API Rate Limiting**: Prevent abuse
- **Audit Logging**: Complete audit trail

### Scalability
- **Database Optimization**: Query optimization and indexing
- **CDN Integration**: Content delivery for images
- **Load Balancing**: Horizontal scaling support
- **Microservices**: Service separation for scalability

## Support

For issues or questions:
1. Check browser console for errors
2. Verify database connectivity
3. Review API response in network tab
4. Check user permissions for accessed features

## License

This stock management system is part of the Ceramic Production Management System.
© 2025 Ceramic Production Management Team.