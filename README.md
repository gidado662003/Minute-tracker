# Minute Tracker

A comprehensive business management platform with modular architecture, featuring Meeting Tracker and Internal Requisitions modules built with Next.js and Express.js.

## 🌟 Features

- **🔐 Laravel Authentication Integration** - Seamless SSO with Laravel ERP system
- **📱 Modular Architecture** - Choose between Meeting Tracker and Internal Requisitions
- **🎨 Modern UI** - Clean, responsive design with Tailwind CSS and shadcn/ui
- **⚡ Real-time Dashboards** - Interactive charts and analytics
- **📊 Advanced Reporting** - Comprehensive metrics and insights
- **🔄 PM2 Production Ready** - Optimized for production deployment
- **🛠️ RESTful API** - Well-documented API endpoints

## 🏗️ Architecture

```
├── client/                 # Next.js frontend application
│   ├── app/               # Next.js 13+ app router
│   ├── components/        # Reusable React components
│   └── lib/              # Utilities and configurations
├── server/                # Express.js backend API
│   ├── src/
│   │   ├── middleware/   # Authentication & validation
│   │   ├── routes/       # API route handlers
│   │   └── models/       # Database models
└── ecosystem.config.js    # PM2 production configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB
- PM2 (installed via npm)
- Laravel ERP system (for authentication)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd minute-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   npm --prefix client install
   npm --prefix server install
   ```

3. **Environment Setup**

   **Server Environment** (`server/.env.production`):

   ```env
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key
   LARAVEL_URL=http://your-laravel-erp-url:8000
   MONGODB_URI=mongodb://localhost:27017/minute-tracker
   ```

   **Client Environment** (`client/.env.local`):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Build for production**

   ```bash
   npm --prefix client run build
   ```

5. **Start with PM2**
   ```bash
   npm run pm2:start
   ```

## 📖 Usage

### First Time Setup

1. **Access the application** at `http://your-server:3000`
2. **Authenticate** - You'll be redirected to Laravel ERP for login
3. **Select Module** - Choose between Meeting Tracker or Internal Requisitions
4. **Start Working** - Access your chosen module's features

<!-- Very important lateef -->

### Module Selection

The application features two main modules:

#### 📅 **Meeting Tracker**

- Create and manage meeting minutes
- AI-powered action item extraction
- Meeting analytics and reporting
- Action item tracking and follow-ups

#### 📋 **Internal Requisitions**

- Submit procurement requests
- Multi-level approval workflows
- Budget tracking and reporting
- Department-wise analytics

### Switching Modules

- Click **"Switch Module"** in the sidebar footer
- Select your preferred module from the selector screen
- Your choice is remembered for future sessions

## 🔧 Development

### Available Scripts

```bash
# Root level scripts
npm run pm2:start      # Start both client and server with PM2
npm run pm2:restart    # Restart PM2 processes
npm run pm2:stop       # Stop PM2 processes
npm run pm2:logs       # View PM2 logs

# Client scripts (from client/ directory)
npm --prefix client run dev        # Start development server
npm --prefix client run build      # Build for production
npm --prefix client run start      # Start production server

# Server scripts (from server/ directory)
npm --prefix server run dev        # Start development server with nodemon
npm --prefix server run start      # Start production server
```

### Development Workflow

1. **Start development servers:**

   ```bash
   # Terminal 1 - Client
   cd client && npm run dev

   # Terminal 2 - Server
   cd server && npm run dev
   ```

2. **Access development URLs:**
   - Client: `http://localhost:3000`
   - Server API: `http://localhost:5000`

## 🏗️ Adding New Modules

Follow these steps to add a new module:

### 1. Frontend Changes

**Add to Module Selector** (`client/components/module-selector.tsx`):

```typescript
// Add new module card with appropriate styling
<Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-[color]-300">
  <CardHeader className="text-center pb-4">
    <div className="w-16 h-16 bg-[color]-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <YourIcon className="h-8 w-8 text-[color]-600" />
    </div>
    <CardTitle className="text-xl text-[color]-900">Your Module Name</CardTitle>
    <CardDescription>Your module description</CardDescription>
  </CardHeader>
  <CardContent className="text-center">
    <Button
      onClick={() => onModuleSelect("your-module-key")}
      className="w-full bg-[color]-600 hover:bg-[color]-700"
      size="lg"
    >
      Select Your Module
    </Button>
  </CardContent>
</Card>
```

**Add to Sidebar** (`client/components/app-sidebar.tsx`):

```typescript
const yourModuleMenuItems: MenuItem[] = [
  {
    label: "Your Module",
    title: "Your Module",
    icon: YourIcon,
    children: [
      { title: "Dashboard", url: "/your-module", icon: BookOpen },
      // ... other menu items
    ],
  },
];

// Add to menuItems logic
} else if (selectedModule === "your-module-key") {
  moduleItems = yourModuleMenuItems;
}
```

**Update Routing** (`client/app/page.tsx`):

```typescript
} else if (selectedModule === "your-module-key") {
  router.replace("/your-module");
}
```

### 2. Create Module Pages

Create the directory structure:

```
client/app/your-module/
├── page.tsx              # Main dashboard
├── sub-feature/
│   └── page.tsx         # Sub-feature page
└── components/          # Module-specific components
```

### 3. Backend API (Optional)

Create API routes if needed:

```
server/src/routes/your-module/
├── your-module.controller.js
├── your-module.routes.js
└── your-module.model.js
```

Register in `server/src/routes/api.js`:

```javascript
const yourModuleRoutes = require("./your-module/your-module.routes");
app.use("/api/your-module", yourModuleRoutes);
```

## 🔐 Authentication

### Laravel Integration

The application integrates with Laravel ERP for authentication:

- **JWT Tokens** - Uses Laravel-issued JWT tokens
- **SSO Flow** - Seamless single sign-on
- **Role-based Access** - Respects Laravel user roles and permissions

### Authentication Flow

1. User accesses application → Redirected to Laravel login
2. Laravel authenticates → Issues JWT token
3. Token stored in localStorage → User gains access
4. API calls include token → Server validates with Laravel

## 📊 API Documentation

### Base URL

```
http://your-server:5000/api
```

### Authentication

All API endpoints require Bearer token authentication:

```
Authorization: Bearer <laravel-jwt-token>
```

### Available Endpoints

#### Meeting Tracker

- `GET /api/meetings` - List meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/:id` - Get meeting details
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

#### Internal Requisitions

- `GET /api/internal-requisitions` - List requisitions
- `POST /api/internal-requisitions` - Create requisition
- `GET /api/internal-requisitions/:id` - Get requisition details
- `PUT /api/internal-requisitions/:id` - Update requisition

#### Authentication

- `POST /api/auth/introspect` - Token introspection
- `GET /api/auth/verify` - Token verification

## 🔧 Configuration

### Environment Variables

#### Server (.env.production)

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-jwt-secret
LARAVEL_URL=http://laravel-erp:8000
MONGODB_URI=mongodb://localhost:27017/minute-tracker
ALLOWED_ORIGINS=http://your-frontend:3000
API_PREFIX=/api
LOG_LEVEL=error
```

#### Client (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_LARAVEL_URL=http://laravel-erp:8000
```

### PM2 Configuration

The `ecosystem.config.js` defines two applications:

- **meeting-api**: Express server on port 5000
- **client**: Next.js app on port 3000

## 📝 Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Follow conventional commit messages

### Component Structure

```
components/
├── ui/              # Reusable UI components (shadcn/ui)
├── dashboard/       # Dashboard-specific components
├── forms/          # Form components
└── module-specific/ # Module-specific components
```

### API Design

- RESTful endpoints
- Consistent error responses
- Input validation with Joi
- Proper HTTP status codes

## 🚀 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database connections tested
- [ ] Client built for production
- [ ] PM2 processes started
- [ ] Nginx/Apache configured (if needed)
- [ ] SSL certificates installed
- [ ] Monitoring set up

### PM2 Management

```bash
# View process status
pm2 status

# View logs
pm2 logs

# Restart specific process
pm2 restart meeting-api
pm2 restart client

# Monitor resources
pm2 monit
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Check the logs in `logs/` directory
- Review PM2 process status
- Ensure all environment variables are set
- Verify Laravel ERP connectivity

---

**Built with ❤️ using Next.js, Express.js, MongoDB, and Laravel integration**
