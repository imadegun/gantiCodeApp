# ClientCode Management System - Enhanced

A comprehensive web application for managing ClientCode data across thousands of collection items with advanced search, filtering, and bulk editing capabilities.

## 🚀 New Features Added

### ✅ Bulk Edit Functionality
- **Multi-select checkboxes** for selecting multiple items
- **Bulk edit dialog** for updating ClientCode on selected items
- **Visual feedback** showing number of selected items
- **Select all checkbox** for quick selection of all items on current page
- **Real-time updates** with success notifications

### ✅ Improved Image Display
- **Fixed 50x50px image size** as requested
- **Smart image URL handling** for filename-only records (e.g., "photoname.jpg")
- **Fallback to icon** when image fails to load
- **Responsive image containers** with proper aspect ratio

### ✅ Enhanced User Experience
- **Checkbox selection** with visual feedback
- **Bulk action toolbar** that appears when items are selected
- **Improved responsive design** for mobile devices
- **Better error handling** and user feedback

## 📋 Complete Feature List

### Core Features
- ✅ **Database Integration** - MySQL connection to gayafusionall database
- ✅ **Advanced Search** - Real-time search across multiple fields
- ✅ **Smart Filtering** - Category and Design filters with dropdowns
- ✅ **Responsive Table** - Mobile-first design with progressive disclosure
- ✅ **Inline Editing** - Edit ClientCode directly in the table
- ✅ **Pagination** - Navigate through large datasets efficiently
- ✅ **Statistics Dashboard** - Real-time data insights

### New Enhanced Features
- ✅ **Smart Bulk Selection** - Select items with checkboxes to activate inline editing
- ✅ **Individual Inline Editing** - Each selected item gets its own editable ClientCode field
- ✅ **Per-Row Save Actions** - Save/Cancel buttons appear for each edited item
- ✅ **Unique Code Support** - Each item can have its own unique ClientCode
- ✅ **Smart Images** - Handle both full URLs and filename-only records
- ✅ **50x50px Images** - Fixed image size as requested
- ✅ **Visual Feedback** - Selection indicators and editing states

## 🛠️ Technical Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes with MySQL2
- **Database**: MySQL (gayafusionall)
- **UI Components**: shadcn/ui with Lucide icons
- **Notifications**: Sonner toast system

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── master/
│   │   │   ├── route.ts              # GET all master data
│   │   │   ├── update/route.ts       # PUT single item update
│   │   │   └── bulk-update/route.ts  # PUT bulk update (NEW)
│   │   ├── categories/route.ts       # GET categories
│   │   └── designs/route.ts          # GET designs
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Enhanced main page
├── components/ui/                    # shadcn/ui components
├── lib/
│   ├── mysql.ts                      # MySQL connection
│   └── utils.ts                      # Utility functions
└── hooks/                            # React hooks
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL Server 8.0+
- Git (optional)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Database**
   - Create `.env` file in project root
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=gayafusionall
   
   # Optional: Custom image server URL (defaults to http://192.168.1.110/upload)
   NEXT_PUBLIC_IMAGE_SERVER_URL=http://192.168.1.110/upload
   ```

3. **Configure Image Server**
   - Your images should be accessible at: `http://192.168.1.110/upload/imagename.jpg`
   - Database should contain only filenames (e.g., "imagename.jpg")
   - Application automatically constructs the full URL

4. **Start Development Server**
   
   **For Windows:**
   ```bash
   npm run dev:windows
   ```
   
   **For Linux/Mac:**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to `http://localhost:3000`

## 📖 Usage Guide

### Individual Edit
1. Click the **Edit** button next to any item
2. Modify the ClientCode in the input field
3. Click **Save** to update or **X** to cancel

### Enhanced Bulk Edit (New Logic)
1. **Select items** using checkboxes in the first column
2. **Inline editing activates** automatically for selected items
3. **Enter unique ClientCode** for each selected item individually
4. **Save each item** using the save icon (💾) next to each input field
5. **Auto-uncheck** - Checkbox automatically unchecks when row is saved
6. **Cancel editing** for individual items using the X icon
7. **Select all checkbox** activates editing for all items on current page
8. **Info bar** shows count of activated items for editing

### Search & Filter
1. **Search** - Type in the search box to filter by ClientCode, Design Name, Category Name, Size Name, or ID
2. **Category Filter** - Select specific category from dropdown
3. **Design Filter** - Select specific design from dropdown
4. **ClientCode Status Filter** - Filter by items with or without ClientCode
   - **All Items** - Shows all records regardless of ClientCode status
   - **With Client Code** - Shows only items that have a ClientCode assigned
   - **Without Client Code** - Shows only items that need a ClientCode (empty or null)
5. **Results** - View filtered results with real-time count

#### ClientCode Status Filter Use Cases:
- **"Without Client Code"** - Perfect for bulk editing items that need codes assigned
- **"With Client Code"** - Useful for reviewing items that already have codes
- **"All Items"** - Default view showing everything

## 🔧 Image Configuration

### Image Server Setup
- Your images are hosted on local server: `http://192.168.1.110/upload/`
- Database should contain only filenames (e.g., "imagename.jpg")
- Application automatically constructs full URLs: `http://192.168.1.110/upload/imagename.jpg`

### Image Display
- **Size**: Fixed 50x50px as requested
- **Fallback**: Shows icon when image fails to load
- **Responsive**: Properly sized on all devices
- **Server Support**: Works with local server images

### Image URL Logic
```javascript
// Handles both full URLs and server filenames
const getImageUrl = (photoName) => {
  if (!photoName) return null;
  
  // Full URLs (existing functionality)
  if (photoName.startsWith('http')) {
    return photoName;
  }
  
  // Server filename (your setup)
  const imageServerUrl = process.env.NEXT_PUBLIC_IMAGE_SERVER_URL || 'http://192.168.1.110/upload';
  return `${imageServerUrl}/${photoName}`;
};
```

### Custom Image Server (Optional)
If your image server changes, update your `.env` file:
```env
NEXT_PUBLIC_IMAGE_SERVER_URL=http://your-server/path/to/images
```

## 🎯 API Endpoints

### Data Retrieval
- `GET /api/master` - Fetch all master data with JOINs
- `GET /api/categories` - Fetch all categories
- `GET /api/designs` - Fetch all designs

### Data Updates
- `PUT /api/master/update` - Update single item
  ```json
  {
    "id": 123,
    "clientCode": "UNIQUE_CODE_123"
  }
  ```

## 📱 Responsive Design

### Mobile (< 640px)
- Essential columns: Photo, ClientCode, Design Name, Actions (horizontal scroll)
- Stacked filters layout
- Touch-friendly buttons

### Tablet (640px - 1024px)
- All columns visible: Photo, ClientCode, Design Name, Size Name, Category Name, Actions
- Grid layout for filters

### Desktop (> 1024px)
- Full table with: Photo, ClientCode, Design Name, Size Name, Category Name, Actions
- Horizontal filters layout
- Enhanced statistics cards

## 🛠️ Development Commands

### For Windows Users
```bash
# Start development server
npm run dev:windows

# Build for production
npm run build

# Start production server
npm run start:windows

# Check code quality
npm run lint
```

### For Linux/Mac Users
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Check code quality
npm run lint
```

### Database Commands (All Platforms)
```bash
# Push database schema
npm run db:push

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Reset database
npm run db:reset
```

## 🔍 Troubleshooting

### Database Connection Issues
- Verify MySQL service is running
- Check credentials in `.env` file
- Ensure database `gayafusionall` exists

### Image Display Issues
- Verify image server is accessible at `http://192.168.1.110/upload/`
- Check filenames match database records
- Ensure server allows cross-origin requests if needed
- Test image URL directly in browser: `http://192.168.1.110/upload/your-image.jpg`

### Enhanced Bulk Edit Issues
- Ensure items are selected before editing (checkbox activates inline editing)
- Check network connection for API calls
- Verify database write permissions
- Each item must have a unique ClientCode

## 📈 Performance Features

- **Optimized queries** with JOIN operations
- **Pagination** to handle large datasets
- **Debounced search** for better performance
- **Lazy loading** for images
- **Efficient state management** with React hooks

## 🎨 UI/UX Features

- **Modern design** with shadcn/ui components
- **Dark mode support** (built-in)
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Accessible markup** with ARIA support
- **Smooth animations** and transitions

---

## 🎉 Ready to Use!

Your enhanced ClientCode Management System is now ready with:
- ✅ **Bulk editing capabilities**
- ✅ **Improved image display (50x50px)**
- ✅ **Smart filename handling**
- ✅ **Enhanced user experience**
- ✅ **Mobile-responsive design**

The application provides an efficient, intuitive interface for managing thousands of collection items with powerful bulk operations and smart image handling.