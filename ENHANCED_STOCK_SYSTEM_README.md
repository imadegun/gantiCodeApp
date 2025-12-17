# Enhanced Stock Management System

This document describes the enhanced stock management system that integrates with the existing MySQL product database and provides advanced features for stock tracking, warehouse management, and expiration monitoring.

## Overview

The enhanced stock system provides:

1. **Product Integration**: Seamless integration with existing MySQL `gayafusionall` database
2. **Warehouse Management**: Multi-warehouse support with shelf-level tracking
3. **Stock Expiration**: Automated monitoring and notifications for expiring stock
4. **Enhanced Stock Properties**: Support for complete sets, body-only, and lid-only items
5. **Offer Management**: Automatic stock reservation and restoration for client offers
6. **Real-time Notifications**: System alerts for low stock and expiring items

## Database Schema

### PostgreSQL (Internal Stock Data)

#### Core Models

**Stock**
- `productId`: References MySQL `tblcollect_master.ID`
- `designCode`, `clientCode`, `nameCode`, etc.: Mirrored from MySQL
- `qty_in`, `qty_offer`, `total`, `availableQuantity`: Stock quantities
- `isComplated_set`, `isBody_only`, `isLid_only`: Stock properties
- `expirationYears`, `expirationDate`: Expiration tracking
- `warehouseId`, `shelfId`: Location tracking
- `status`: Stock status (available, low_stock, out_of_stock)

**Warehouse**
- `name`, `code`, `location`, `description`: Warehouse details
- `isActive`: Active status
- Relation to `Shelf` and `Stock` models

**Shelf**
- `warehouseId`: Parent warehouse
- `code`, `row`, `column`, `level`: Shelf location details
- Relation to `Stock` model

**StockNotification**
- `stockId`: Related stock item
- `type`: EXPIRATION_WARNING, EXPIRATION_NOTICE, LOW_STOCK, OFFER_EXPIRY
- `message`, `isRead`, `sentAt`: Notification details

**StockOffer**
- `stockId`: Related stock item
- `clientId`: Client being offered to
- `quantity`, `status`: Offer details
- `offerDate`, `expiryDate`: Offer timing

### MySQL (Product Data)

The system integrates with these existing tables:

- `tblcollect_master`: Main product table
- `tblcollect_design`: Design information
- `tblcollect_name`: Product names
- `tblcollect_category`: Product categories
- `tblcollect_color`: Color information
- `tblcollect_texture`: Texture details
- `tblcollect_size`: Size information
- `tblcollect_material`: Material details

## API Endpoints

### Enhanced Stock Management

#### `/api/stock/enhanced`
- **GET**: Retrieve enhanced stock data with product information
  - Query params: `warehouseId`, `status`, `expiring`
  - Returns: Stock items with full product details and warehouse info
- **POST**: Create new stock entry
  - Body: `productId`, `qty_in`, `isComplated_set`, `isBody_only`, `isLid_only`, `expirationYears`, `warehouseId`, `shelfId`, `notes`, `createdBy`
  - Returns: Created stock entry with product details

#### `/api/stock/warehouses`
- **GET**: Retrieve all warehouses with stock counts
- **POST**: Create new warehouse
  - Body: `name`, `code`, `location`, `description`

#### `/api/stock/shelves`
- **GET**: Retrieve shelves (optionally filtered by warehouse)
  - Query params: `warehouseId`
- **POST**: Create new shelf
  - Body: `warehouseId`, `code`, `row`, `column`, `level`, `description`

#### `/api/stock/products`
- **GET**: Retrieve products from MySQL for stock creation
  - Query params: `search`, `clientCode`, `designCode`, `categoryCode`, `page`, `limit`
  - Returns: Paginated product list with full details

#### `/api/stock/offers/enhanced`
- **GET**: Retrieve stock offers with details
- **POST**: Create stock offer (automatically reserves stock)
  - Body: `stockId`, `clientId`, `quantity`, `expiryDays`, `notes`, `createdBy`
- **PUT**: Update offer status (approve, reject, cancel, expire)
  - Body: `offerId`, `action`, `reason`
  - Automatically handles stock restoration for cancelled/expired offers

#### `/api/stock/notifications`
- **GET**: Retrieve stock notifications
  - Query params: `type`, `isRead`, `stockId`
- **POST**: Create notification
- **PUT**: Mark notifications as read
  - Body: `notificationIds` or `markAll: true`

#### `/api/stock/check-expiration`
- **POST**: Check for expiring stock and create notifications
  - Query params: `days` (default: 30)
  - Automatically creates notifications for expiring stock
  - Handles expired offers and stock restoration

## Frontend Components

### Enhanced Stock Management Page (`/stock/enhanced`)

#### Features:
1. **Stock Overview Tab**
   - Advanced filtering (status, warehouse, search)
   - Product images and detailed information
   - Expiration warnings
   - Warehouse and shelf location display
   - Detailed stock view dialog

2. **Add Stock Tab**
   - Product selection with search
   - Warehouse assignment
   - Expiration years selection (2, 5, 10)
   - Stock properties (complete set, body only, lid only)
   - Notes and quantity entry

3. **Warehouses Tab**
   - Warehouse overview with stock counts
   - Location and description display
   - Shelf count per warehouse

4. **Notifications Tab**
   - Stock expiration warnings
   - Low stock alerts
   - Offer expiry notifications

## Key Features

### Automatic Stock Management
- **Offer Processing**: Stock automatically reserved when offers are created
- **Stock Restoration**: Stock automatically returned to available when offers are cancelled or expire
- **Status Updates**: Stock status automatically updated based on quantity levels

### Expiration Monitoring
- **Configurable Periods**: 2, 5, or 10 year expiration periods
- **Automated Notifications**: System checks for expiring stock and creates notifications
- **Visual Warnings**: Expiring items highlighted in the interface

### Warehouse Integration
- **Multi-warehouse Support**: Stock can be assigned to different warehouses
- **Shelf-level Tracking**: Precise location tracking within warehouses
- **Location Display**: Row, column, and level information

### Product Data Integration
- **Real-time Sync**: Product data fetched from MySQL in real-time
- **Complete Information**: All product attributes available in stock views
- **Search Functionality**: Product search across multiple attributes

## Usage Workflow

### Adding Stock
1. Navigate to `/stock/enhanced`
2. Click "Add Stock" tab
3. Search and select a product from the MySQL database
4. Enter quantity and select warehouse
5. Set expiration period and stock properties
6. Add notes if needed
7. Click "Add Stock"

### Managing Offers
1. Stock offers automatically reserve inventory
2. When approved, stock is permanently reduced
3. When cancelled/expired, stock returns to available
4. All actions are logged and tracked

### Monitoring Expirations
1. System automatically checks for expiring stock
2. Notifications created for items approaching expiration
3. Visual warnings in the stock overview
4. Detailed expiration information in stock details

### Warehouse Management
1. Create warehouses via API or interface
2. Add shelves within warehouses
3. Assign stock to specific locations
4. Track stock by warehouse and shelf

## Integration Points

### MySQL Integration
- Product data read from existing `gayafusionall` database
- No changes required to existing product structure
- Real-time data synchronization

### Legacy Compatibility
- Existing `/api/stock` endpoints remain functional
- Old stock tracking models preserved
- Gradual migration path available

## Security Considerations

### Access Control
- User authentication required for stock operations
- Role-based permissions for different actions
- Audit trail for all stock modifications

### Data Integrity
- Database transactions for critical operations
- Validation of stock quantities
- Prevention of negative inventory levels

## Performance Optimizations

### Database Indexing
- Indexed queries on frequently accessed fields
- Optimized joins with MySQL product data
- Efficient pagination for large datasets

### Caching
- Product data caching for frequently accessed items
- Warehouse and shelf data caching
- Optimized search functionality

## Future Enhancements

### Planned Features
1. **Mobile App**: Native mobile application for stock management
2. **Barcode Scanning**: Integration with barcode scanners
3. **Advanced Analytics**: Stock movement analytics and reporting
4. **API Rate Limiting**: Enhanced API security and performance
5. **Email Notifications**: Automated email alerts for critical events

### Scalability
1. **Multi-tenant Support**: Support for multiple organizations
2. **Advanced Permissions**: Granular role-based access control
3. **Integration APIs**: Webhook support for external integrations
4. **Performance Monitoring**: Advanced performance metrics and alerting

## Troubleshooting

### Common Issues
1. **MySQL Connection**: Check database credentials and connectivity
2. **Stock Synchronization**: Ensure proper transaction handling
3. **Notification Delays**: Verify cron job configuration
4. **Performance**: Monitor database query performance

### Debugging
1. Enable detailed logging in API endpoints
2. Monitor database query execution
3. Check browser console for frontend errors
4. Verify database connection strings

## Support

For technical support or questions about the enhanced stock system:
1. Check this documentation first
2. Review API response messages
3. Examine browser developer tools
4. Contact system administrator with detailed error information