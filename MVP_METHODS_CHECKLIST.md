# Sunsama API Methods - MVP Checklist

## 🎯 MVP Goal
**Implement basic API methods to validate authentication works with real endpoints**
**Timeline**: 2-3 days
**Success**: Can make authenticated API calls and retrieve data from Sunsama

---

## 📋 Core MVP Tasks

### 1. Research Sunsama API Endpoints ✅ COMPLETED
- ✅ Identified GraphQL endpoint: `https://api.sunsama.com/graphql`
- ✅ Found `getUser` operation with full query structure
- [ ] Research `getTasksBacklog` and `getTasksByDay` operations
- ✅ Document GraphQL request/response formats

### 2. Implement Three Core API Methods
- ✅ `getUser()` - Get current user profile/information
- [ ] `getTasksBacklog()` - Get tasks in the backlog
- [ ] `getTasksByDay(date)` - Get tasks for a specific day
- ✅ Implement proper TypeScript types for user responses
- ✅ Add GraphQL error handling

### 3. Test Authenticated Requests
- [ ] Create test that authenticates and makes API call
- [ ] Verify cookies are properly sent with requests
- [ ] Verify responses are properly parsed
- [ ] Handle common HTTP errors (401, 403, 500, etc.)

### 4. Manual Testing
- [ ] Test with real Sunsama credentials
- [ ] Verify login flow works end-to-end
- [ ] Verify API calls return expected data
- [ ] Test error scenarios (invalid credentials, network issues)

---

## 🧪 MVP Validation

### Test Scenarios
- [ ] Login with valid credentials → Make API call → Receive data
- [ ] Login with invalid credentials → Receive proper error
- [ ] Make API call without authentication → Receive 401 error
- [ ] Session persistence across multiple API calls

### Success Metrics
- [ ] Can authenticate and retrieve user data via `getUser()`
- [ ] Can retrieve backlog tasks via `getTasksBacklog()`
- [ ] Can retrieve daily tasks via `getTasksByDay(date)`
- [ ] Proper error handling for all failure scenarios
- [ ] Cookie-based session works for multiple requests

---

## 🎯 MVP Success Criteria

**Working prototype that can:**
1. [ ] Authenticate with real Sunsama credentials
2. [ ] Make authenticated API calls to retrieve data
3. [ ] Handle authentication errors gracefully
4. [ ] Persist session across multiple API calls
5. [ ] Provide type-safe responses for API data

**Example working code:**
```typescript
const client = new SunsamaClient();
await client.login('real@email.com', 'password');

// Should work after authentication
const user = await client.getUser();
const backlogTasks = await client.getTasksBacklog();
const todayTasks = await client.getTasksByDay('2024-01-15');

console.log('User:', user.name);
console.log('Backlog tasks:', backlogTasks.length);
console.log('Today tasks:', todayTasks.length);
```

---

## 🚀 Implementation Order

### Day 1 ✅ COMPLETED
- ✅ Research Sunsama API endpoints (found GraphQL structure)
- ✅ Implement `getUser()` method
- ✅ Add TypeScript types for user data
- ✅ Basic testing with getUser method

### Day 2
- [ ] Implement `getTasksBacklog()` method
- [ ] Implement `getTasksByDay(date)` method
- [ ] Add TypeScript types for task data
- [ ] Add comprehensive error handling
- [ ] Manual testing with real credentials

### Day 3
- [ ] Final validation and testing
- [ ] Documentation updates
- [ ] Polish and cleanup

---

## 🚫 Explicitly NOT in MVP

- ❌ Comprehensive API coverage (only 3 specific methods)
- ❌ Task creation/modification endpoints
- ❌ Calendar integration endpoints
- ❌ Advanced error recovery
- ❌ Rate limiting handling
- ❌ Caching mechanisms
- ❌ Real-time updates/webhooks
- ❌ Bulk operations
- ❌ Advanced TypeScript generics
- ❌ Performance optimization
- ❌ Comprehensive documentation