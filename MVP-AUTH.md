# Sunsama API Authentication - MVP Checklist

## 🎯 MVP Goal
**Get basic email/password authentication working with session management**
**Timeline**: 3-5 days
**Success**: Can authenticate and make API calls with session cookies

---

## 📋 Core MVP Tasks

### 1. Remove API Key Code ✅ COMPLETED
- ✅ Remove `apiKey` from `SunsamaClientConfig` interface in `src/types/client.ts`
- ✅ Remove `apiKey` from client constructor in `src/client/index.ts`

### 2. Add Basic Authentication Config ✅ COMPLETED  
- ✅ Add to `SunsamaClientConfig`:
  ```typescript
  sessionToken?: string;
  ```
- ✅ Simplified to only accept optional session token (removed email/password from constructor)

### 3. Create Simple AuthManager ✅ COMPLETED (Simplified)
- ✅ Integrated authentication directly into `SunsamaClient` class:
  ```typescript
  class SunsamaClient {
    private _sessionToken?: string;
    
    async login(email: string, password: string): Promise<void>
    isAuthenticated(): boolean
    getSessionToken(): string | undefined
    logout(): void
  }
  ```

### 4. Implement Login Endpoint
- [ ] Create login function that:
  - [ ] Makes POST to `https://api.sunsama.com/account/login/email`
  - [ ] Sets headers: `Content-Type: application/x-www-form-urlencoded`, `Origin: https://app.sunsama.com`
  - [ ] Sends body: `email=USER_EMAIL&password=PASSWORD`
  - [ ] Extracts `sunsamaSession` cookie from response
  - [ ] Stores session token in memory

### 5. Basic Cookie Management
- [ ] Install cookie handling library (e.g., `tough-cookie`)
- [ ] Create simple cookie jar for session management
- [ ] Store `sunsamaSession` cookie with proper attributes
- [ ] Auto-include session cookie in subsequent requests

### 6. Update HTTP Client
- [ ] Modify HTTP client to:
  - [ ] Use cookie jar for automatic cookie handling
  - [ ] Set `Origin: https://app.sunsama.com` header on all requests
  - [ ] Handle cookie persistence across requests

### 7. Update Client Constructor
- [ ] Modify `SunsamaClient` constructor to:
  - [ ] Initialize `AuthManager`
  - [ ] Call `login()` if email/password provided
  - [ ] Set session token if provided directly

### 8. Basic Error Handling ✅ COMPLETED
- ✅ Add simple `SunsamaAuthError` class
- ✅ Throw auth errors for:
  - ✅ Login failures (placeholder implementation)
  - ✅ Missing authentication config (handled by TypeScript types)

---

## 🧪 MVP Validation

### Test Manually
- ✅ Can create client with optional session token
- ✅ Can create client with no authentication 
- [ ] Login succeeds with valid credentials (Day 2)
- [ ] Login fails with invalid credentials (Day 2)
- [ ] Can make authenticated API calls (Day 3)
- [ ] Session token is included in requests (Day 3)

### Simple Test ✅ COMPLETED
- ✅ Create basic test file that validates:
  - ✅ Client creation with and without auth
  - ✅ Authentication state management
  - ✅ Basic method availability

---

## 🚫 Explicitly NOT in MVP

- ❌ Comprehensive testing
- ❌ Documentation updates
- ❌ Session refresh/expiration
- ❌ Logout functionality ✅ (Actually implemented - was simple)
- ❌ Environment variable support
- ❌ Performance optimization
- ❌ Security hardening
- ❌ Error recovery
- ❌ JWT token parsing/validation
- ❌ TypeScript declaration files
- ❌ Code comments/JSDoc
- ❌ README updates

---

## 🎯 MVP Success Criteria

**Working prototype that can:**
1. ✅ Create client with optional session token
2. [ ] Authenticate with Sunsama using email/password (Day 2)
3. [ ] Store session cookie in memory (Day 2)
4. [ ] Make authenticated API requests (Day 3)
5. [ ] Handle basic login errors (Day 2)

**Example working code:**
```typescript
// Current (Day 1 complete)
const client = new SunsamaClient({
  sessionToken: 'existing-token' // optional
});

// Goal (Day 2-3)
const client = new SunsamaClient();
await client.login('user@example.com', 'password');
const tasks = await client.tasks.list(); // Should work after authentication
```

---

## 🚀 Implementation Order

### Day 1 ✅ COMPLETED
- ✅ Remove API key code
- ✅ Add basic auth config (simplified to session token only)
- ✅ Integrate authentication into client (no separate AuthManager)
- ✅ Basic error handling setup
- ✅ Updated tests

### Day 2  
- [ ] Implement login endpoint
- [ ] Basic cookie jar setup
- [ ] Session token storage via cookies

### Day 3
- [ ] Update HTTP client for authenticated requests
- [ ] Update client constructor

### Day 4
- [ ] Basic error handling
- [ ] Manual testing and fixes

### Day 5
- [ ] Polish and basic test
- [ ] Validate MVP works end-to-end
