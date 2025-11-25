# Laravel Integration Testing Checklist

## Pre-Testing Setup

### ✅ Laravel App Requirements

- [x] Laravel app running on `http://10.0.0.253:8000`
- [x] User can log in and receive session cookie
- [x] Laravel Sanctum is installed and configured
- [ ] `AuthTokenController` created in `app/Http/Controllers/Api/AuthTokenController.php`
- [ ] `AuthIntrospectController` created in `app/Http/Controllers/Api/AuthIntrospectController.php`
- [ ] Routes added to `routes/api.php`:
  - `POST /api/auth/token/current` → `auth:sanctum` middleware
  - `POST /api/auth/introspect` → rate limited

### ✅ Express Server

- [x] Express server configured to use Laravel auth middleware
- [x] Default Laravel URL: `http://10.0.0.253:8000`
- [x] Middleware properly attached to routes
- [x] Department information extracted from Laravel user data

### ✅ Next.js Client

- [x] Frontend configured to fetch Laravel PAT
- [x] Default Laravel URL: `http://10.0.0.253:8000`
- [x] `ensureAuthToken()` function exported
- [ ] Frontend calls `ensureAuthToken()` after login

## Testing Steps

### 1. Test Laravel Endpoints

**Test Token Issuance:**
```bash
# Make sure you're logged into Laravel first
curl -X POST http://10.0.0.253:8000/api/auth/token/current \
  -H "Content-Type: application/json" \
  -b "laravel_session=YOUR_SESSION_COOKIE" \
  -d '{"device_name": "test-client"}'

# Expected: { "token": "...", "user": {...} }
```

**Test Token Introspection:**
```bash
curl -X POST http://10.0.0.253:8000/api/auth/introspect \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN_HERE"}'

# Expected: { "active": true, "user": {...}, "abilities": [...] }
```

### 2. Test Frontend Token Fetch

**Browser Console Test:**
1. Log in to Laravel application
2. Open browser DevTools → Console
3. Run:
```javascript
import { ensureAuthToken } from '@/app/api';
await ensureAuthToken();
```

**Expected:**
- Token stored in `localStorage.authToken`
- No errors in console
- Network tab shows successful call to `/api/auth/token/current`

### 3. Test Express API Authentication

**Without Token (Should Fail):**
```bash
curl http://10.0.0.253:5000/api/meetings

# Expected: 401 { "message": "No token provided" }
```

**With Token (Should Succeed):**
```bash
# Get token from localStorage or Laravel
curl http://10.0.0.253:5000/api/meetings \
  -H "Authorization: Bearer YOUR_LARAVEL_PAT_HERE"

# Expected: 200 with meetings filtered by department
```

**With Expired Token (Should Fail):**
```bash
curl http://10.0.0.253:5000/api/meetings \
  -H "Authorization: Bearer expired_token"

# Expected: 401 { "message": "Invalid token" }
```

### 4. Test Department Filtering

**Verify meetings are filtered by user's department:**
1. Create meeting with department "HR"
2. Login as user with department "Engineering"
3. Fetch meetings via Express API
4. **Expected:** Only Engineering meetings returned

### 5. Test Error Handling

**Laravel Down:**
1. Stop Laravel server
2. Make request to Express API
3. **Expected:** 503 { "message": "Auth service unavailable" }

**Invalid Token:**
1. Send request with random token
2. **Expected:** 401 { "message": "Invalid token" }

**Expired Session:**
1. Wait for token to expire (or revoke in Laravel)
2. Make Express API call
3. **Expected:** 401, frontend clears token and reloads

## Common Issues

### "No token provided"
- **Cause:** Frontend not calling `ensureAuthToken()` after login
- **Fix:** Add call to `ensureAuthToken()` in your login success handler

### "Auth service unavailable"
- **Cause:** Laravel not running or wrong URL
- **Fix:** Check Laravel is on `10.0.0.253:8000` and Express can reach it

### "Invalid token"
- **Cause:** Token not in database or expired
- **Fix:** Check Laravel token exists and hasn't expired

### Department not filtering
- **Cause:** User object from Laravel doesn't include department
- **Fix:** Verify `AuthIntrospectController` returns `department` field

### CORS issues
- **Cause:** Laravel not allowing requests from Express origin
- **Fix:** Add Express URL to Laravel CORS allowed origins

## Success Criteria

✅ User logs into Laravel → receives session cookie
✅ Frontend fetches PAT → stores in localStorage
✅ Express API calls work → token validated by Laravel
✅ Department filtering works → only user's department data shown
✅ Error handling works → proper messages and auto-cleanup
✅ Tokens expire gracefully → user redirected to login

## Next Steps After Successful Testing

1. Add token refresh logic for long-lived sessions
2. Implement secure token storage (HTTP-only cookies)
3. Add request caching to reduce Laravel introspection calls
4. Set up monitoring for auth service availability
5. Add logging for failed auth attempts
6. Consider rate limiting based on department/role



