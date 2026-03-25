# Quick Reference & Developer Guide

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
npm run seed        # Populate with test charities and users
npm run dev         # Start on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # Start on http://localhost:5173
```

### Test Accounts
- **User**: user@example.com / User@12345
- **Admin**: admin@example.com / Admin@12345

---

## 📱 Key Pages & Routes

| Route | Purpose | Auth Required | Role |
|-------|---------|---------------|------|
| `/` | Homepage | No | All |
| `/login` | User login | No | All |
| `/register` | User registration | No | All |
| `/subscription` | Select plan & charity | Yes | USER |
| `/charities` | Browse charities | No | All |
| `/dashboard` | User dashboard | Yes | USER |
| `/admin` | Admin dashboard | Yes | ADMIN |

---

## 🔑 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost/golf-charity
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=1h
CORS_ORIGIN=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_MONTH_PLAN_ID=price_xxxxx
STRIPE_YEAR_PLAN_ID=price_xxxxx
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

---

## 💾 Database Models

```javascript
// User
{
  email, passwordHash, fullName, role,
  subscriptionId, selectedCharityId, charityPercentage,
  golfscores[], isSubscribed, subscriptionEndDate, wonDraws[]
}

// Subscription
{
  userId, planType, price, status,
  startDate, renewalDate, endDate,
  stripeSubscriptionId, charityPercentage, charityAmount
}

// GolfScore
{
  userId, score (1-45), date, courseInfo,
  createdAt (auto-enforces 5-score limit)
}

// Charity
{
  name, description, imageUrl,
  website, email, totalContributed,
  isActive, isFeatured, upcomingEvents[], supporters
}

// Draw
{
  drawMonth, status, drawType,
  winningNumbers, totalPrizePool,
  participants[], participantCount,
  publishedAt, simulationResults, carryoverAmount
}

// Winner
{
  drawId, userId, matchType, winAmount,
  proofScreenshotUrl, verificationStatus, paymentStatus,
  approvedBy, rejectionReason, paidAt
}
```

---

## 🎯 Main Features To Test

### 1. Subscription Flow
- Register → Select plan → Choose charity → Adjust % → Pay

### 2. Score Management
- Add score → View history → Edit → Delete → See stats

### 3. Draw System
- Auto-enter users → Admin simulates → Admin publishes → See winners

### 4. Winner Verification
- Upload proof → Admin approves → Mark paid

### 5. Admin Controls
- View pending winners → Create draws → Simulate → Publish results

---

## 📊 Data Relationships

```
User
├── 1: Subscription (one active at a time)
├── 1: Charity (selected charity)
├── Many: GolfScore (max 5 active)
├── Many: Winner (from draws won)

Draw
├── Many: Winner (results)
└── Many: User (participants)

Charity
└── Many: User (subscribers supporting it)
```

---

## 🔐 Authentication Flow

```
1. User registers → passwordHash stored
2. User logs in → JWT + RefreshToken issued
3. Frontend stores JWT (localStorage)
4. API calls include JWT header
5. Backend validates JWT
6. If expired → RefreshToken refreshes it
7. User logout → tokens cleared
```

---

## 🎨 Component Structure

```
App.jsx (routes)
└── AppLayout
    ├── Navbar.jsx (navigation)
    └── Pages
        ├── HomePage.jsx
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── SubscriptionPage.jsx
        ├── CharitiesListPage.jsx
        ├── UserDashboardPage.jsx
        │   └── ScoreEntryForm.jsx
        ├── AdminDashboardPage.jsx
        │   ├── DrawsManagement
        │   ├── WinnersManagement
        │   ├── UsersManagement
        │   ├── CharitiesManagement
        │   └── AnalyticsView
```

---

## 🔌 Common API Calls

```javascript
// From golf.js API client

// Subscriptions
createSubscriptionRequest(planType, charityId, charityPercentage)
checkSubscriptionStatusRequest()

// Scores
addGolfScoreRequest(score, date, courseInfo)
getUserScoresRequest()
getScoreStatsRequest()

// Charities
listCharitiesRequest(search, featured)
getFeaturedCharitiesRequest()
selectCharityRequest(charityId, charityPercentage)

// Draws
createDrawRequest(drawMonth, drawType)
simulateDrawRequest(drawId)
publishDrawResultsRequest(drawId)
getUserDrawParticipationRequest()

// Winners
submitWinnerProofRequest(winnerId, proofScreenshotUrl)
approveWinnerRequest(winnerId)
rejectWinnerRequest(winnerId, rejectionReason)
markWinnerAsPaidRequest(winnerId, stripePayoutId)
```

---

## 🧪 Testing Tips

### Test Score Logic
```javascript
// Add scores programmatically
const scores = [35, 38, 40, 42, 39];
// Then add 6th score → should auto-delete oldest
```

### Test Draw Simulation
```javascript
// Admin only
POST /draws/:drawId/simulate
// Returns winning numbers
// Check if they match any participant scores
```

### Test Prize Distribution
```javascript
// Verify prize math
5-match: 40% of pool
4-match: 35% of pool  
3-match: 25% of pool
Total: 100% (- charity %)
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot read property 'map' of undefined" | Model not returning data - check query |
| "No active subscription" | User must subscribe first |
| "Unauthorized" | Check JWT token, might be expired |
| "Score must be 1-45" | Input validation - check form |
| "Charity not found" | CharityId must exist - check seed data |
| CORS errors | Check CORS_ORIGIN in backend .env |
| MongoDB connection failed | MongoDB must be running, check URI |

---

## 📈 Scaling Considerations

### Database
- Add indexes for frequent queries ✓
- Implement pagination for large datasets
- Consider database sharding for millions of users

### API
- Implement caching layer (Redis)
- API rate limiting per user/IP
- Async task queue for draw simulations

### Frontend
- Code splitting by route
- Image optimization
- Service workers for offline capability

---

## 🎯 Next Steps for Enhancement

1. **Email Notifications**
   - Subscription confirmation
   - Draw results
   - Winner verification status
   - Payment receipts

2. **Mobile App**
   - React Native version
   - Push notifications
   - Camera for proof upload

3. **Analytics**
   - User engagement metrics
   - Revenue dashboards
   - Charity impact reports

4. **Community**
   - Leaderboards
   - Social sharing
   - User profiles
   - Comments on charities

5. **Gamification**
   - Badges and achievements
   - Streak tracking
   - Multiplayer challenges

---

## 📚 Additional Resources

- **PRD Document**: See IMPLEMENTATION_GUIDE.md
- **Feature Validation**: See FEATURE_VALIDATION.md
- **API Docs**: Endpoints documented in routes files
- **Models**: See /backend/src/models/
- **Controllers**: See /backend/src/controllers/

---

## 👥 Support

For implementation questions:
1. Check the PRD (digitalheroes)
2. Review IMPLEMENTATION_GUIDE.md
3. Check FEATURE_VALIDATION.md
4. Examine code comments in controllers/models

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**Status**: Production Ready
