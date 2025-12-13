# ClientCode Management System Specification

## Overview

The ClientCode Management System is a Next.js web application designed to manage ClientCode assignments for ceramic collection items stored in a MySQL database. The system provides an efficient interface for viewing product lists, updating ClientCode values, and accessing detailed product information.

## Architecture

### Technology Stack
- **Frontend**: Next.js 14 with TypeScript, React
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL (gayafusionall database)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── master/
│   │   │   ├── route.ts (GET: fetch product list)
│   │   │   ├── update/route.ts (PUT: update ClientCode)
│   │   │   └── bulk-update/route.ts
│   │   └── products/[id]/
│   │       └── route.ts (GET: fetch product details)
│   ├── products/[id]/
│   │   └── page.tsx (Product detail page)
│   ├── layout.tsx
│   └── page.tsx (Main product list page)
├── components/ui/ (Shadcn components)
├── lib/
│   ├── mysql.ts (Database connection)
│   └── utils.ts
└── hooks/
```

## Database Schema

### Core Tables
- **tblcollect_master**: Main product table
  - ID (Primary Key)
  - ClientCode (String, nullable)
  - DesignCode, CategoryCode, SizeCode (Foreign Keys)
  - Photo1-4 (Image URLs)
  - Various technical fields (dimensions, materials, etc.)

- **tblcollect_design**: Design information
- **tblcollect_category**: Category information
- **tblcollect_size**: Size information
- **tblcollect_texture**: Texture information
- **tblcollect_material**: Material information
- **tblcollect_color**: Color information

### Relationships
- Master table links to design, category, size, texture, material, color tables
- Additional tables for glaze, stain, lustre, engobe, tools

## API Endpoints

### Master Data
- `GET /api/master`: Fetch paginated product list with basic info
- `PUT /api/master/update`: Update ClientCode for a product
- `POST /api/master/bulk-update`: Bulk update ClientCode

### Product Details
- `GET /api/products/[id]`: Fetch detailed product information with related items

## Current Features

### Product List (Main Page)
- Displays table with: ID, ClientCode, Design Name, Category, Size, Photo
- Inline editing for ClientCode
- Search and filter capabilities
- Pagination

### Product Details Page
- Comprehensive product information in tabbed layout:
  - Basic Information
  - Technical Specifications (dimensions, volume)
  - Materials & Finishes
  - Production Process
  - Additional Information
- Product images gallery
- Related items section

### Code Change Feature
- Update ClientCode for individual products
- Bulk update functionality
- Real-time validation
- Success/error notifications

## Planned Features

### Product Detail Popup
- Click on product code in list to open modal
- Tabbed interface matching detail page
- Quick access without navigation
- Responsive design for mobile/desktop

### Enhanced Search & Filters
- Advanced filtering by multiple criteria
- Saved filter presets
- Export functionality

### Image Management
- Upload new product images
- Image optimization and resizing
- Gallery management

### Audit Trail
- Track ClientCode changes
- User activity logging
- Change history

## Technical Considerations

### Performance
- Database connection pooling
- Efficient queries with proper indexing
- Image lazy loading
- Pagination for large datasets

### Security
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Environment variable management

### Scalability
- Modular component architecture
- Reusable API patterns
- TypeScript for type safety
- Responsive design principles

## Development Guidelines

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Consistent naming conventions
- Component composition over inheritance

### Database Operations
- Use parameterized queries
- Proper error handling
- Transaction management for bulk operations
- Connection pool management

### UI/UX
- Consistent design system
- Accessible components
- Loading states and error handling
- Mobile-first responsive design

## Deployment

### Environment Setup
- MySQL database configuration
- Environment variables (.env)
- Docker containerization
- Production build optimization

### Monitoring
- Error logging
- Performance monitoring
- Database health checks
- User analytics

## Future Enhancements

1. **Advanced Analytics**: Product usage statistics, ClientCode distribution analysis
2. **Integration APIs**: Third-party system integrations
3. **Multi-language Support**: Internationalization
4. **Offline Capability**: Progressive Web App features
5. **Real-time Collaboration**: Multi-user editing with conflict resolution

## Conclusion

This specification provides a comprehensive overview of the ClientCode Management System, serving as a foundation for future development and maintenance. The modular architecture and clear separation of concerns ensure maintainability and extensibility.