# Windows Setup Guide

## 🪟 Quick Start for Windows Users

### Prerequisites
- Node.js 18+ installed
- MySQL Server 8.0+ running
- Command Prompt or PowerShell

### Step-by-Step Setup

#### 1. Install Dependencies
```cmd
npm install
```

#### 2. Configure Environment
Create a `.env` file in the project root:
```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=gayafusionall
NEXT_PUBLIC_IMAGE_SERVER_URL=http://192.168.1.110/upload
```

#### 3. Start Development Server
```cmd
npm run dev:windows
```

#### 4. Open Application
Navigate to: `http://localhost:3000`

## 🚀 Windows Commands

### Development
```cmd
# Start development server
npm run dev:windows

# Check code quality
npm run lint
```

### Production
```cmd
# Build application
npm run build

# Start production server
npm run start:windows
```

### Database
```cmd
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate
```

## 🔧 Common Windows Issues & Solutions

### Issue: 'NODE_ENV' is not recognized
**Solution**: Use the Windows-specific commands:
```cmd
npm run start:windows
```

### Issue: 'tee' command not found
**Solution**: The Windows scripts don't use `tee`:
```cmd
npm run dev:windows
npm run start:windows
```

### Issue: MySQL connection fails
**Solution**: 
1. Ensure MySQL service is running
2. Check credentials in `.env` file
3. Verify database `gayafusionall` exists

### Issue: Images don't load
**Solution**:
1. Test image URL: `http://192.168.1.110/upload/your-image.jpg`
2. Check server accessibility
3. Verify image filenames in database

## 📱 Testing Your Setup

1. **Test Database Connection**
   - If the app loads data, MySQL connection works

2. **Test Image Display**
   - Visit `http://localhost:3000/test-images`
   - Enter an image filename from your server
   - Verify the 50x50px preview works

3. **Test Bulk Edit**
   - Select items with checkboxes
   - Use bulk edit dialog
   - Verify updates save correctly

## 🎯 Ready to Use!

Your ClientCode Management System is now configured for Windows with:
- ✅ Bulk editing capabilities
- ✅ Server image display (50x50px)
- ✅ Windows-compatible scripts
- ✅ Enhanced user experience

For detailed documentation, see the main [README.md](README.md) file.