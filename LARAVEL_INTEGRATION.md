# Laravel Authentication Integration Guide

This document describes how to integrate Laravel's authentication system with the Express/Next.js Minute-tracker application.

## Overview

The Minute-tracker application now supports Laravel-based authentication using Personal Access Tokens (PATs). The integration follows this flow:

1. **User logs into Laravel** (session-based, cookie auth)
2. **Frontend fetches a Personal Access Token** from Laravel using the session cookie
3. **All Express API calls** include the PAT in the `Authorization: Bearer <token>` header
4. **Express middleware verifies** the PAT with Laravel's introspection endpoint
5. **Express attaches user info** to requests for use in route handlers

## Laravel Setup Required

You need to add two endpoints to your Laravel application:

### 1. Create AuthTokenController

Create `app/Http/Controllers/Api/AuthTokenController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AuthTokenController extends Controller
{
    public function issueForCurrentUser(Request $request)
    {
        $user = $request->user(); // requires auth via session (sanctum/web)
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $deviceName = $request->input('device_name', 'express-client');
        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
            ],
        ]);
    }
}
```

### 2. Create AuthIntrospectController

Create `app/Http/Controllers/Api/AuthIntrospectController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Laravel\Sanctum\PersonalAccessToken;

class AuthIntrospectController extends Controller
{
    public function __invoke(Request $request)
    {
        $request->validate(['token' => ['required','string']]);

        $accessToken = PersonalAccessToken::findToken($request->token);
        if (!$accessToken || ($accessToken->expires_at && $accessToken->expires_at->isPast())) {
            return response()->json(['active' => false]);
        }

        $user = $accessToken->tokenable;

        return response()->json([
            'active' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'role' => $user->role,
                'department' => $user->department,
            ],
            'abilities' => $accessToken->abilities ?? [],
        ]);
    }
}
```

### 3. Add Routes

In your `routes/api.php`, add:

```php
use App\Http\Controllers\Api\AuthTokenController;
use App\Http\Controllers\Api\AuthIntrospectController;

// Issue a PAT for the already-logged-in user (uses session cookie)
Route::post('/auth/token/current', [AuthTokenController::class, 'issueForCurrentUser'])
    ->middleware(['auth:sanctum']); // session-based auth

// Introspect a PAT sent by Express (token in body)
Route::post('/auth/introspect', AuthIntrospectController::class)
    ->middleware(['throttle:30,1']);
```

## Environment Variables

### Express Server (.env.development or .env.production)

Add to your Express server environment configuration:

```env
# Laravel authentication service URL
LARAVEL_URL=http://localhost:8000
```

### Next.js Client

Create or update your `.env.local` file in the `client/` directory:

```env
# Laravel base URL for fetching PATs
NEXT_PUBLIC_LARAVEL_URL=http://localhost:8000
```

## How It Works

### Frontend Flow

1. **After user logs into Laravel**, call `ensureAuthToken()` from `api.js`
2. This function fetches a PAT from Laravel's `/api/auth/token/current` endpoint
3. The PAT is stored in `localStorage` as `authToken`
4. All subsequent API calls to Express automatically include the PAT in the `Authorization` header

### Express Flow

1. **All protected routes** go through `laravelAuth` middleware
2. The middleware extracts the Bearer token from the request header
3. It calls Laravel's `/api/auth/introspect` endpoint to verify the token
4. If valid, it attaches `req.user` with the user information and `req.department` for filtering
5. Route handlers can access `req.user` to get the authenticated user and `req.department` for meeting/requisition filtering

### Authentication Middleware Priority

```javascript
// Department routes don't need Laravel auth (they work with simple JWT)
router.use("/department", Department);

// All other routes require Laravel authentication
router.use(laravelAuth);
router.use("/meetings", Meeting);
router.use("/webhook", webhookRouter);
router.use("/internal-requisitions", internalRequisitionRouter);
```

## Usage in Frontend

After a user logs into Laravel, call:

```javascript
import { ensureAuthToken } from "@/app/api";

// After successful Laravel login
try {
  await ensureAuthToken();
  // Token is now stored and will be used automatically for Express API calls
} catch (error) {
  console.error("Failed to get auth token:", error);
}
```

All API calls from `api.js` will automatically include the Laravel PAT:

```javascript
import { getMeetings, createMeeting } from "@/app/api";

// These calls automatically include Authorization: Bearer <Laravel PAT>
const meetings = await getMeetings();
const newMeeting = await createMeeting(meetingData);
```

## Error Handling

### Token Expired or Invalid

When Laravel returns a 401:

- The Express middleware returns `401 Invalid token`
- The frontend interceptor clears `authToken` and `department` from localStorage
- The page reloads, triggering the login flow

### Laravel Service Unavailable

When Laravel is unreachable:

- The Express middleware returns `503 Auth service unavailable`
- Frontend shows the error to the user
- Admin should check Laravel service status

## Security Considerations

1. **Token Storage**: Currently using `localStorage`. Consider upgrading to secure, HTTP-only cookies for production
2. **Token Expiration**: Configure token expiration in Laravel Sanctum settings
3. **HTTPS**: Always use HTTPS in production for all services
4. **CORS**: Configure allowed origins in both Laravel and Express
5. **Rate Limiting**: Introspection endpoint is rate-limited to 30 requests/minute

## Testing the Integration

1. Start Laravel service on port 8000
2. Start Express server on port 5000 (or configured port)
3. Start Next.js client on port 3000
4. Login to Laravel application
5. Navigate to Express-powered pages
6. Check browser Network tab to see PAT being sent in Authorization header
7. Check Express logs to see successful Laravel validation

## Troubleshooting

### "No token provided"

- Check that `ensureAuthToken()` was called after login
- Verify `localStorage.authToken` exists in browser

### "Invalid token"

- Token may have expired
- Check Laravel Sanctum expiration settings
- Verify token was properly stored

### "Auth service unavailable"

- Verify Laravel is running
- Check `LARAVEL_URL` environment variable
- Check network connectivity between Express and Laravel
- Review Laravel logs for introspection endpoint errors

## Files Modified

- `server/src/middleware/laravelAuth.middleware.js` - NEW: Verifies PATs with Laravel
- `server/src/routes/api.js` - UPDATED: Uses Laravel auth middleware
- `client/app/api.js` - UPDATED: Fetches and includes Laravel PAT in requests

## Next Steps

1. Implement the two Laravel controllers above
2. Add the API routes to Laravel
3. Configure environment variables
4. Test the integration
5. Consider adding token refresh logic
6. Implement secure token storage (HTTP-only cookies)
