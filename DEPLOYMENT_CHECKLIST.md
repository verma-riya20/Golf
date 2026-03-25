# 🚀 Deployment Checklist

## Pre-Deployment Verification

### Backend Setup Verification
- [ ] Node.js v18+ installed
- [ ] MongoDB connection working (`npm run seed`)
- [ ] All environment variables configured
- [ ] Stripe keys properly set
- [ ] JWT_SECRET set (random strong string)
- [ ] CORS_ORIGIN matches frontend URL
- [ ] npm dependencies installed (`npm install`)

### Frontend Setup Verification
- [ ] Node.js v18+ installed
- [ ] npm dependencies installed (`npm install`)
- [ ] API endpoint environment variable set correctly
- [ ] All pages render without errors
- [ ] Responsive design tested on mobile (Chrome DevTools)

### Database Verification
- [ ] MongoDB instance accessible
- [ ] MONGODB_URI correct in .env
- [ ] Seed script ran successfully
- [ ] 5 charities in database
- [ ] 2 test users created
- [ ] Collections created: User, Subscription, GolfScore, Charity, Draw, Winner

---

## Development Testing Checklist

### Authentication Flows
- [ ] Register new user
- [ ] Login with credentials
- [ ] JWT token received and stored
- [ ] Logout clears token
- [ ] Protected routes redirect to login
- [ ] Token refresh works
- [ ] Admin login works
- [ ] Admin role recognized

### Subscription Flows
- [ ] View subscription page
- [ ] Select monthly plan
- [ ] Select yearly plan
- [ ] See price difference
- [ ] Choose charity from list
- [ ] Adjust charity percentage (10-100%)
- [ ] Summary shows correct amounts
- [ ] (Stripe test payment when connected)

### Golf Score Management
- [ ] Add score (1-45)
- [ ] Add multiple scores (test max 5)
- [ ] See scores in dashboard
- [ ] View statistics (avg, best, worst)
- [ ] Edit score successfully
- [ ] Delete score successfully
- [ ] Verify oldest score removed when 6th added

### Draw System (Admin Only)
- [ ] Create draw for current month
- [ ] Simulate with random logic
- [ ] Simulate with algorithmic logic
- [ ] See winning numbers generated
- [ ] Publish results
- [ ] See drawn winners listed
- [ ] Verify prize distribution (40/35/25)

### Winner Verification (Admin Only)
- [ ] See pending winner submissions
- [ ] Approve winner submission
- [ ] Reject winner with reason
- [ ] Mark winner as paid
- [ ] Verify payment status updated
- [ ] User sees payment status in dashboard

### Charity Features
- [ ] Browse all charities
- [ ] Search charities
- [ ] Filter charities
- [ ] View featured charities on homepage
- [ ] See charity details
- [ ] User can select charity

### User Dashboard
- [ ] Display active subscription status
- [ ] Show days remaining to renewal
- [ ] Display golf scores section
- [ ] Show score entry form
- [ ] Display score statistics
- [ ] Show selected charity info
- [ ] Show draw participation count
- [ ] Show wins with payment status

### Admin Dashboard
- [ ] Overview tab shows metrics
- [ ] Draw management tab works
- [ ] Winner verification tab works
- [ ] User management accessible
- [ ] Charity management accessible
- [ ] Analytics section displays

### UI/UX Verification
- [ ] Homepage loads correctly
- [ ] All pages render without errors
- [ ] Mobile responsive (< 620px width)
- [ ] Tablet responsive (620px - 1024px)
- [ ] Desktop responsive (> 1024px)
- [ ] No layout shifts or overflow
- [ ] Links navigate correctly
- [ ] Forms have proper validation
- [ ] Error messages are clear

### Error Handling
- [ ] Invalid score shows error
- [ ] Missing required fields show error
- [ ] Network errors handled gracefully
- [ ] 404 pages redirect properly
- [ ] 401 unauthorized handled
- [ ] 500 server errors handled

---

## Pre-Production Deployment

### Backend Deployment Checklist

#### Environment Setup
- [ ] NODE_ENV=production
- [ ] MONGODB_URI set to production cluster
- [ ] All required secrets configured:
  - [ ] JWT_SECRET (new, strong random string)
  - [ ] STRIPE_SECRET_KEY (live key)
  - [ ] STRIPE_MONTH_PLAN_ID
  - [ ] STRIPE_YEAR_PLAN_ID
  - [ ] CORS_ORIGIN (production frontend URL)
- [ ] HTTPS enforced
- [ ] Rate limiting configured (250 req/15min)

#### Deployment Platform Configuration
- [ ] Deployment region selected
- [ ] Auto-scaling configured
- [ ] Health check endpoint `/api/v1/health`
- [ ] Logs configured
- [ ] Environment variables secured (not in code)
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`

#### Database Migration
- [ ] Production MongoDB cluster created
- [ ] Backup enabled
- [ ] Connection string verified
- [ ] Production seed data considered

#### Security Verification
- [ ] No API keys in code
- [ ] No hardcoded credentials
- [ ] CORS properly restrictive
- [ ] Helmet security headers enabled
- [ ] Rate limiting active
- [ ] Input validation enabled
- [ ] HTTPS only (no HTTP)

#### API Testing
- [ ] All endpoints tested against production
- [ ] Stripe integration tested
- [ ] Error responses proper format
- [ ] Performance acceptable (<200ms)

---

### Frontend Deployment Checklist

#### Build Configuration
- [ ] `npm run build` completes successfully
- [ ] No build errors or warnings
- [ ] Bundle size acceptable (<500KB)
- [ ] Source maps generated for debugging

#### Environment Configuration
- [ ] VITE_API_URL set to production backend
- [ ] VITE_STRIPE_PUBLIC_KEY set (live key)
- [ ] No development URLs in build
- [ ] Environment variables in .env.production

#### Deployment Platform Configuration
- [ ] Static hosting configured
- [ ] Build command: `npm run build`
- [ ] Build output: `dist` directory
- [ ] Environment variables configured
- [ ] Redirects for SPA routing configured

#### Pre-Launch Testing
- [ ] Production build tested locally:
  - [ ] `npm run build`
  - [ ] `npm run preview`
- [ ] All pages load correctly
- [ ] Mobile responsive verified
- [ ] API calls reach correct endpoint
- [ ] Authentication flow works
- [ ] No console errors

#### Performance
- [ ] Lighthouse score > 90
- [ ] Image files optimized
- [ ] CSS/JS minified
- [ ] Caching headers configured
- [ ] CDN configured if available

---

## Post-Deployment Verification

### Smoke Tests (Do These First!)
- [ ] Homepage loads
- [ ] Register new user
- [ ] Login with user
- [ ] Access user dashboard
- [ ] Admin login
- [ ] Access admin dashboard
- [ ] No 404 errors in console

### Functional Tests
- [ ] Add golf score (end-to-end)
- [ ] Create subscription (without payment)
- [ ] Select charity
- [ ] Admin creates draw
- [ ] Admin simulates draw
- [ ] Admin publishes draw
- [ ] Winners appear
- [ ] Admin approves winner

### Performance Tests
- [ ] Page load times < 3s
- [ ] API responses < 200ms
- [ ] No console JavaScript errors
- [ ] Memory usage stable
- [ ] CPU usage reasonable

### Security Tests
- [ ] Cannot access admin without role
- [ ] Cannot view other user's data
- [ ] Invalid JWT rejected
- [ ] CSRF protection active
- [ ] XSS protection active

### Monitoring Setup
- [ ] Error logging configured
- [ ] Performance monitoring enabled
- [ ] User analytics configured
- [ ] Uptime monitoring active
- [ ] Alert notifications configured

---

## Production Support

### Health Checks
- [ ] Endpoint: `GET /api/v1/health`
- [ ] Expected: `{"status": "ok", "service": "backend"}`
- [ ] Check every 5 minutes

### Common Production Issues

| Issue | Solution | Checklist |
|-------|----------|-----------|
| 502 Bad Gateway | Check backend health | [ ] SSH to server, check logs |
| Slow responses | Check database performance | [ ] Verify MongoDB indexes |
| JWT errors | Verify secret matches | [ ] Check JWT_SECRET in both envs |
| CORS errors | Update CORS_ORIGIN | [ ] Verify frontend domain |
| Payment failures | Check Stripe setup | [ ] Verify API keys, plan IDs |
| Email not sending | Configure email service | [ ] Verify email provider |

### Monitoring Dashboard
- [ ] Backend logs accessible
- [ ] Database monitoring enabled
- [ ] Error tracking active (Sentry, etc.)
- [ ] Uptime monitoring (Pingdom, etc.)
- [ ] Performance APM configured

---

## Post-Deployment Support

### First 24 Hours
- [ ] Monitor error logs hourly
- [ ] Check database performance
- [ ] Monitor API response times
- [ ] Verify payment processing working
- [ ] Test user registration flow
- [ ] Check subscription creation

### First Week
- [ ] Monitor for unusual patterns
- [ ] Verify all features working
- [ ] Check database backup completion
- [ ] Review user feedback
- [ ] Performance optimization if needed

### Ongoing
- [ ] Daily log review
- [ ] Weekly performance checks
- [ ] Monthly security updates
- [ ] Quarterly feature review
- [ ] User support response

---

## Rollback Plan

### If Deployment Fails

**Backend:**
```bash
# Revert to previous version
git revert <commit-hash>
npm run build
# Redeploy with previous version
```

**Frontend:**
```bash
# Serve previous bundle
# Most platforms have rollback button
```

**Database:**
- Use MongoDB backup
- Contact database provider for restore

---

## Communication Checklist

- [ ] Notify stakeholders of deployment
- [ ] Prepare release notes
- [ ] Update documentation
- [ ] Inform support team
- [ ] Schedule post-deployment review
- [ ] Brief team on changes

---

## Go-Live Readiness

### Final Verification Before Launch
- [ ] All features tested
- [ ] Security audit complete
- [ ] Performance acceptable
- [ ] Team trained
- [ ] Support docs ready
- [ ] Backup/recovery plan ready
- [ ] Rollback procedure documented
- [ ] Monitoring alerts configured
- [ ] Error tracking active
- [ ] Team on-call schedule set

### Launch Approval Sign-Off
- [ ] Product Owner: _______________
- [ ] Tech Lead: _______________
- [ ] QA Lead: _______________
- [ ] DevOps/Deployment: _______________
- [ ] Date/Time: _______________

---

## Post-Launch Celebration 🎉

After successful deployment:
- [ ] Document lessons learned
- [ ] Share success with team
- [ ] Thank all contributors
- [ ] Plan next features
- [ ] Gather user feedback

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Status**: _______________

---

For questions: Refer to IMPLEMENTATION_GUIDE.md, FEATURE_VALIDATION.md, or QUICK_REFERENCE.md
