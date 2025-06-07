# Sunsama API Authentication - MVP Checklist

## 🎯 MVP Goal
**Get basic email/password authentication working with session management**
**Timeline**: 3-5 days
**Success**: Can authenticate and make API calls with session cookies

---

## 📋 Core MVP Tasks

### 1. Remove API Key Code
- [ ] Remove `apiKey` from `SunsamaClientConfig` interface in `src/types/client.ts`
- [ ] Remove `apiKey` from client constructor in `src/client/index.ts`

### 2. Add Basic Authentication Config
- [ ] Add to `SunsamaClientConfig`:
  ```typescript
  email?: string;
  password?: string;
  sessionToken?: string;
  ```
- [ ] Add basic validation: require either `email`+`password` OR `sessionToken`

### 3. Create Simple AuthManager
- [ ] Create `src/auth/AuthManager.ts` with minimal class:
  ```typescript
  class AuthManager {
    private sessionToken?: string;
    
    async login(email: string, password: string): Promise<void>
    isAuthenticated(): boolean
    getSessionToken(): string | undefined
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

### 8. Basic Error Handling
- [ ] Add simple `SunsamaAuthError` class
- [ ] Throw auth errors for:
  - [ ] Invalid credentials (401/403 responses)
  - [ ] Missing authentication config
  - [ ] Login failures

---

## 🧪 MVP Validation

### Test Manually
- [ ] Can create client with email/password
- [ ] Login succeeds with valid credentials
- [ ] Login fails with invalid credentials  
- [ ] Can make authenticated API calls
- [ ] Session token is included in requests

### Simple Test
- [ ] Create one basic test file that validates:
  - [ ] Client creation with auth
  - [ ] Login flow works
  - [ ] Authenticated requests work

---

## 🚫 Explicitly NOT in MVP

- ❌ Comprehensive testing
- ❌ Documentation updates
- ❌ Session refresh/expiration
- ❌ Logout functionality
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
1. ✅ Authenticate with Sunsama using email/password
2. ✅ Store session cookie in memory
3. ✅ Make authenticated API requests
4. ✅ Handle basic login errors

**Example working code:**
```typescript
const client = new SunsamaClient({
  email: 'user@example.com',
  password: 'password'
});

// Should work after authentication
const tasks = await client.tasks.list();
```

---

## 🚀 Implementation Order

### Day 1
- [ ] Remove API key code
- [ ] Add basic auth config
- [ ] Create skeleton AuthManager

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
