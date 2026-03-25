# Golf Charity Subscription Platform

A modern, emotion-driven web application for golf enthusiasts combining performance tracking, charity fundraising, and monthly prize draws.

## 🎯 Platform Features

### Core Features Implemented

#### 1. **Subscription System**
- Monthly ($29.99) and Yearly ($299.90 with 10% discount) plans
- Stripe integration for secure payments
- Subscription lifecycle management (active, cancelled, lapsed)
- Automatic renewal handling
- Real-time subscription status checking

#### 2. **Golf Score Management**
- Track latest 5 golf scores in Stableford format (1-45 points)
- Automatic score rotation (oldest replaced when new score added)
- Score history with chronological sorting
- Score statistics (average, best, worst)
- Course information tracking

#### 3. **Draw & Prize System**
- Monthly draws with automated participant entry
- Two draw logic options:
  - **Random**: Standard lottery-style draw
  - **Algorithmic**: Weighted by player scores
- Prize distribution:
  - 5-Number Match: 40% (Jackpot with carryover support)
  - 4-Number Match: 35%
  - 3-Number Match: 25%
- Admin simulation and pre-analysis before publishing
- Winning number generation and participant matching

#### 4. **Winner Verification System**
- Proof upload for score verification
- Admin review workflow (Approve/Reject)
- Payment status tracking (Pending/Paid)
- Rejection reason documentation
- Payout management with Stripe integration

#### 5. **Charity Integration**
- Browse supported charities with filtering
- User selects preferred charity at signup
- Minimum 10% subscription fee goes to charity
- Users can increase charity contribution (up to 100%)
- Featured charity spotlight on homepage
- Charity profiles with event information
- Total contribution tracking per charity

#### 6. **User Dashboard**
- Real-time subscription status and renewal dates
- Golf score entry interface with date picker
- Charity selection and contribution percentage
- Draw participation summary
- Win history with payment status
- Score statistics and trending

#### 7. **Admin Dashboard**
- **Dashboard Overview**: Key metrics at a glance
- **Draw Management**: 
  - Create monthly draws
  - Run simulations
  - Publish verified results
  - View draw statistics
- **Winner Verification**:
  - Pending submission review
  - Approve/Reject with feedback
  - Mark payouts as completed
- **User Management**: 
  - View user profiles
  - Edit subscription status
  - Manage golf scores
- **Charity Management**:
  - Add/Edit/Delete charities
  - Set featured status
  - View contribution totals
- **Analytics & Reports**:
  - Total users and revenue
  - Prize pool distribution
  - Charity contribution stats
  - Draw performance metrics

#### 8. **UI/UX Requirements**
- Clean, modern, motion-enhanced interface
- Emotion-driven design focusing on charity impact
- Mobile-first, fully responsive layout
- Smooth animations and transitions
- Prominent subscription CTA
- Clear communication of user actions and charity impact

---

## 🛠️ Technical Stack

### Backend
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with refresh tokens
- **Payment**: Stripe API integration
- **Security**: 
  - bcryptjs for password hashing
  - helmet for security headers
  - CORS configuration
  - Rate limiting
- **Validation**: Zod schema validation
- **Error Handling**: Custom error middleware
- **Logging**: Morgan HTTP logger

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v7
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Features**:
  - Responsive grid layouts
  - Protected routes with role-based access
  - Authentication context provider
  - Optimistic UI updates

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Database & environment config
│   ├── controllers/      # Business logic controllers
│   │   ├── auth.controller.js
│   │   ├── subscription.controller.js
│   │   ├── score.controller.js
│   │   ├── charity.controller.js
│   │   ├── draw.controller.js
│   │   └── winner.controller.js
│   ├── middleware/       # Express middleware
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Subscription.js
│   │   ├── GolfScore.js
│   │   ├── Charity.js
│   │   ├── Draw.js
│   │   └── Winner.js
│   ├── routes/          # API route definitions
│   ├── scripts/         # Database seeding
│   └── utils/           # Helper functions

frontend/
├── src/
│   ├── api/             # API client functions
│   │   └── golf.js      # Golf platform API endpoints
│   ├── components/      # React components
│   ├── pages/           # Page components
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── SubscriptionPage.jsx
│   │   ├── UserDashboardPage.jsx
│   │   ├── CharitiesListPage.jsx
│   │   └── AdminDashboardPage.jsx
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Layout components
│   └── providers/       # Context providers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or cloud)
- Stripe account for payment processing
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration:
# - MONGODB_URI
# - STRIPE_SECRET_KEY
# - JWT_SECRET
# - CORS_ORIGIN

# Run database seed
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout user

### Subscriptions
- `POST /api/v1/subscriptions` - Create subscription
- `GET /api/v1/subscriptions` - Get user subscription
- `DELETE /api/v1/subscriptions` - Cancel subscription
- `GET /api/v1/subscriptions/status/check` - Check subscription status

### Golf Scores
- `POST /api/v1/scores` - Add golf score
- `GET /api/v1/scores` - Get user's latest 5 scores
- `PUT /api/v1/scores/:scoreId` - Update score
- `DELETE /api/v1/scores/:scoreId` - Delete score
- `GET /api/v1/scores/stats` - Get score statistics

### Charities
- `GET /api/v1/charities` - List charities with search/filter
- `GET /api/v1/charities/featured` - Get featured charities
- `GET /api/v1/charities/:charityId` - Get charity details
- `POST /api/v1/charities` - Create charity (Admin)
- `PUT /api/v1/charities/:charityId` - Update charity (Admin)
- `DELETE /api/v1/charities/:charityId` - Delete charity (Admin)
- `POST /api/v1/charities/select` - Select charity for user

### Draws
- `POST /api/v1/draws` - Create draw (Admin)
- `GET /api/v1/draws` - List draws
- `GET /api/v1/draws/:drawId` - Get draw details
- `POST /api/v1/draws/:drawId/simulate` - Simulate draw (Admin)
- `POST /api/v1/draws/:drawId/publish` - Publish results (Admin)
- `GET /api/v1/draws/user/participation` - Get user's draw participation

### Winners & Verification
- `POST /api/v1/winners/:winnerId/proof` - Submit proof screenshot
- `GET /api/v1/winners/:winnerId` - Get winner details
- `GET /api/v1/winners/user/wins` - Get user's wins
- `GET /api/v1/winners/admin/pending` - Get pending verifications (Admin)
- `POST /api/v1/winners/:winnerId/approve` - Approve winner (Admin)
- `POST /api/v1/winners/:winnerId/reject` - Reject winner (Admin)
- `POST /api/v1/winners/:winnerId/mark-paid` - Mark as paid (Admin)
- `GET /api/v1/winners/admin/all` - Get all winners (Admin)
- `GET /api/v1/winners/admin/stats` - Get winner statistics (Admin)

---

## 🧪 Testing Credentials

### User Account
- Email: `user@example.com`
- Password: `User@12345`

### Admin Account
- Email: `admin@example.com`
- Password: `Admin@12345`

### Test Charities
Five pre-seeded charities are available:
- World Golf Foundation (Featured)
- Drive, Chip & Putt Championship (Featured)
- PGA Tour Charities (Featured)
- Golf Channel Foundation
- American Junior Golf Association

---

## 📊 Database Schema

### User
- email, passwordHash, fullName, role
- subscriptionId, selectedCharityId, charityPercentage
- golfscores[], isSubscribed, subscriptionEndDate
- wonDraws[]

### Subscription
- userId, planType, price, status
- startDate, renewalDate, endDate
- stripeSubscriptionId, charityPercentage, charityAmount
- autoRenew

### GolfScore
- userId, score (1-45), date, courseInfo
- Auto-enforces 5-score limit per user

### Charity
- name, description, imageUrl
- website, email, totalContributed
- isActive, isFeatured
- upcomingEvents[], supporters

### Draw
- drawMonth, status (DRAFT/SIMULATED/PUBLISHED)
- drawType (RANDOM/ALGORITHMIC)
- winningNumbers, totalPrizePool
- participants, participantCount
- publishedAt, simulationResults

### Winner
- drawId, userId, matchType (5/4/3-MATCH)
- winAmount, proofScreenshotUrl
- verificationStatus, paymentStatus
- approvedBy, rejectionReason, paidAt

---

## 🔒 Security Measures

- ✅ Password hashing with bcryptjs (12 rounds)
- ✅ JWT authentication with refresh tokens
- ✅ HTTPS enforced in production
- ✅ CORS properly configured
- ✅ Rate limiting (250 requests/15 min)
- ✅ Helmet security headers
- ✅ Input validation with Zod
- ✅ SQL injection protection (MongoDB)
- ✅ XSS protection
- ✅ Admin-only endpoints protected
- ✅ User can only access their own data

---

## 🧹 Code Quality

- Well-structured and commented code
- Separation of concerns (controllers, models, routes)
- Error handling middleware
- Async/await with proper error catching
- Consistent naming conventions
- Responsive UI components
- Mobile-first design approach

---

## 🚢 Deployment

### Backend Deployment (Vercel/Railway/Heroku)
```bash
# Set environment variables in deployment platform
# Run migrations if needed
# Deploy from git repository
```

### Frontend Deployment (Vercel/Netlify)
```bash
# Build production bundle
npm run build

# Deploy from git repository
# Set API endpoint environment variable
```

### Database (MongoDB Atlas)
- Create cloud cluster
- Configure network access
- Set connection string in backend env

### Stripe Setup
- Create Stripe account
- Add product plans
- Get API keys for environment

---

## 📋 Checklist

### ✅ Implemented Features
- [x] User authentication & registration
- [x] Subscription plans (monthly/yearly)
- [x] Golf score management (5-score rolling logic)
- [x] Draw system with random and algorithmic modes
- [x] Winner verification with proof upload
- [x] Charity selection and contribution tracking
- [x] User dashboard with all required sections
- [x] Admin dashboard with full control
- [x] Charity listing and profiles
- [x] Responsive mobile design
- [x] Stripe payment integration
- [x] Email notifications (backend ready)
- [x] Error handling and edge cases
- [x] Security best practices
- [x] Database seeding with test data

### 🎯 Testing Checklist
- [ ] Register new user
- [ ] Subscribe (monthly and yearly)
- [ ] Add golf scores
- [ ] Edit and delete scores
- [ ] Select charity
- [ ] Increase charity percentage
- [ ] User can see draws they're in
- [ ] Admin can create and simulate draws
- [ ] Admin can publish results
- [ ] Winners appear in results
- [ ] Admin can verify winners
- [ ] Admin can mark as paid
- [ ] User dashboard shows all info
- [ ] Responsive on mobile devices
- [ ] Error messages are clear

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MONGODB_URI in .env
- Check network access in MongoDB Atlas
- Ensure user credentials are correct

### Stripe Errors
- Verify STRIPE_SECRET_KEY is correct
- Check Stripe webhook configuration
- Ensure plan IDs match environment

### JWT Issues
- Verify JWT_SECRET is set
- Check token expiration times
- Clear browser cookies if needed

### Port Already in Use
```bash
# Change port in .env or kill process:
lsof -i :5000  # Find process
kill -9 <PID>   # Kill process
```

---

## 📞 Support & Questions

For issues or questions about the platform, refer to the PRD document or check the codebase comments.

---

## 📄 License

Proprietary - Digital Heroes Training Program

---

**Created**: March 2026  
**Version**: 1.0.0  
**Status**: Production Ready
