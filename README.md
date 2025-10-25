# Universal Link Tracker Dashboard

A comprehensive analytics dashboard for the Universal Link Tracker system built with Next.js 14, TypeScript, and shadcn/ui.

## 🚀 Features

- **Authentication**: Secure password-based login with JWT sessions
- **Brands Management**: View and manage all brands with statistics
- **Links Management**: Create, view, and manage tracked links
- **Analytics Dashboard**: Detailed session analytics with event tracking
- **Overview Dashboard**: Key metrics and performance indicators
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui + Tailwind CSS
- **Database**: AWS DynamoDB
- **State Management**: TanStack React Query
- **Authentication**: JWT with bcrypt password hashing
- **Icons**: Lucide React

## 📦 Installation

1. **Clone and navigate to the dashboard directory**:

   ```bash
   cd dashboard
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp env.example .env.local
   ```

4. **Configure your environment variables in `.env.local`**:

   ```env
   # Dashboard Authentication
   DASHBOARD_PASSWORD_HASH=your-bcrypt-hashed-password
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters

   # AWS Configuration
   AWS_REGION=us-east-2
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key

   # DynamoDB Tables
   DYNAMODB_BRANDS_TABLE=universal-link-tracker-brands-production
   DYNAMODB_EVENTS_TABLE=universal-link-tracker-events-production
   DYNAMODB_LEGACY_TABLE=universal-link-tracker-production

   # API Gateway
   NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-gateway-url

   # Link Tracker API Key (required for POST /links)
   LINK_TRACKER_API_KEY=your-api-key-here

   # App Configuration
   NEXT_PUBLIC_APP_NAME=Universal Link Tracker Dashboard
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Generate password hash**:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
   ```
   Copy the output to `DASHBOARD_PASSWORD_HASH` in `.env.local`.

## 🏃‍♂️ Development

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Login**:
   Use the password you hashed in the environment setup

## 📁 Project Structure

```
dashboard/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Protected dashboard pages
│   │   ├── page.tsx           # Overview dashboard
│   │   ├── brands/            # Brands management
│   │   ├── links/             # Links management
│   │   └── analytics/         # Analytics dashboard
│   ├── api/                   # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── brands/            # Brand management
│   │   ├── links/             # Link management
│   │   ├── events/            # Event analytics
│   │   └── stats/             # Statistics
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── dashboard/             # Dashboard-specific components
│   ├── layout/                # Layout components
│   └── providers/             # React Query provider
├── lib/
│   ├── auth/                  # Authentication utilities
│   ├── dynamodb/              # DynamoDB integration
│   └── utils.ts               # Utility functions
├── types/                     # TypeScript type definitions
└── middleware.ts              # Authentication middleware
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Brands

- `GET /api/brands` - Get all brands with statistics

### Links

- `POST /api/links` - Create new tracked link (requires API key)
  - **Headers**: `x-api-key` (automatically added by backend)
  - **Rate Limits**: 100 requests/second, 200 burst, 100k/day
  - **Error Responses**:
    - `403 Forbidden` - Invalid or missing API key
    - `429 Too Many Requests` - Rate limit exceeded (includes `Retry-After` header)
    - `400 Bad Request` - Validation errors
    - `500 Internal Server Error` - Server errors

### Analytics

- `GET /api/events/sessions` - Get user sessions
- `GET /api/stats/overview` - Get dashboard overview statistics

## 🛡️ Error Handling

The dashboard includes comprehensive error handling for all API operations:

### Link Creation Errors

**Authentication Errors (403)**
- Displayed message: "Invalid or missing API key. Please contact your administrator."
- Action: Contact system administrator to verify API key configuration

**Rate Limiting Errors (429)**
- Displayed message: "Rate limit exceeded. Please try again in X seconds."
- Action: Automatic retry suggestion with countdown timer
- The error toast will display for the duration of the retry period

**Validation Errors (400)**
- Displayed message: Specific validation error details
- Action: Correct the input and retry

### Rate Limit Information

The API enforces the following rate limits:
- **POST /links**: 100 requests/second, 200 burst capacity, 100,000 requests/day
- **GET /track**: 1,000 requests/minute per IP
- **GET /pixel.js**: 10,000 requests/minute per IP

Rate limit headers are parsed and displayed to users when limits are approached.

## 🚀 Deployment

### Cloudflare Pages

1. **Push to GitHub**:

   ```bash
   git init
   git add .
   git commit -m "Initial dashboard implementation"
   git remote add origin https://github.com/your-username/universal-link-tracker-dashboard.git
   git push -u origin main
   ```

2. **Deploy to Cloudflare Pages**:

   - Go to Cloudflare Dashboard → Pages
   - Connect your GitHub repository
   - Set build settings:
     - Framework preset: Next.js
     - Build command: `npm run build`
     - Build output directory: `.next`
     - Root directory: `dashboard` (if in subfolder)

3. **Add environment variables** in Cloudflare Pages settings

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:

- `DASHBOARD_PASSWORD_HASH`
- `JWT_SECRET`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DYNAMODB_BRANDS_TABLE`
- `DYNAMODB_EVENTS_TABLE`
- `DYNAMODB_LEGACY_TABLE`
- `NEXT_PUBLIC_API_GATEWAY_URL`
- `LINK_TRACKER_API_KEY` (required for link creation)

## 🔐 Security

- Password-based authentication with bcrypt hashing
- JWT session tokens with 24-hour expiration
- HTTP-only cookies for session storage
- Middleware protection for all dashboard routes
- Secure headers in production
- API key authentication for link creation endpoint
- Rate limiting protection (100 req/sec, 100k daily quota)
- Automatic retry handling for rate limit errors

## 📊 Features Overview

### Dashboard

- Overview statistics (brands, links, clicks, events)
- Key performance indicators
- Recent activity monitoring

### Brands Management

- View all brands with statistics
- Brand performance metrics
- Link counts by status (active/inactive/expired)

### Links Management

- View all tracked links
- Copy links to clipboard
- Link status management
- Performance metrics

### Analytics

- Session-based event tracking
- Geographic distribution
- Event timeline visualization
- User behavior analysis

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 📝 License

This project is part of the Universal Link Tracker system.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please refer to the main Universal Link Tracker documentation.
